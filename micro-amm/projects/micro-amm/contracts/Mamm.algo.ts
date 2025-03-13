/* eslint-disable no-lonely-if */
// This file implements a Micro-AMM (Automated Market Maker) contract on Algorand using TEALScript

import { Contract } from '@algorandfoundation/tealscript';

// The contract's version (used for tracking upgrades)
const VERSION = 1000;

// The minimum balance requirement for holding tokens
const TOKEN_MBR = 100_000;

const LP_TOKEN_SUPPLY = 99_999_999_999_999;

// This class defines the main contract, storing and managing global state
export class Mamm extends Contract {
  // TEAL program version to compile and run
  programVersion = 11;

  // Global State
  // Holds the current reserve of primary tokens
  primary_token_reserve = GlobalStateKey<uint64>({ key: 'ptr' });

  // Holds the current reserve of secondary tokens
  secondary_token_reserve = GlobalStateKey<uint64>({ key: 'str' });

  primary_token_id = GlobalStateKey<uint64>({ key: 'pti' });

  secondary_token_id = GlobalStateKey<uint64>({ key: 'sti' });

  total_lp_supply = GlobalStateKey<uint64>({ key: 'tlps' });

  lp_tokens_issued = GlobalStateKey<uint64>({ key: 'lpti' });

  k_value = GlobalStateKey<uint64>({ key: 'k' });

  lp_token_id = GlobalStateKey<uint64>({ key: 'lp' });

  lp_token_name = GlobalStateKey<string>({ key: 'lpn' });

  lp_token_symbol = GlobalStateKey<string>({ key: 'lps' });

  lp_token_decimals = GlobalStateKey<uint64>({ key: 'lpd' });

  lp_token_url = GlobalStateKey<string>({ key: 'lpu' });

  swap_fee_bps = GlobalStateKey<uint64>({ key: 'sfbps' }); // admin can update

  protocol_fee_bps = GlobalStateKey<uint64>({ key: 'pfbps' }); // admin can update

  admin = GlobalStateKey<Address>({ key: 'admin' }); // can be updated

  treasury_address = GlobalStateKey<Address>({ key: 'treasury' }); // can be updated

  minimum_balance = GlobalStateKey<uint64>({ key: 'minbal' }); // can be updated

  contract_ending = GlobalStateKey<uint64>({ key: 'end' });

  contract_version = GlobalStateKey<uint64>({ key: 'version' });

  // Lifecycle functions
  // Initializes admin to the creator of the application
  createApplication(): void {
    this.admin.value = this.txn.sender;
  }

  deleteApplication(): void {
    assert(this.admin.value === this.txn.sender, 'Only admin can delete the application');
    assert(this.contract_ending.value === 1, 'Contract needs to be ending first');
    assert(this.primary_token_reserve.value === 0, 'Primary reserve must be empty');
    assert(this.secondary_token_reserve.value === 0, 'Secondary reserve must be empty');

    // opt out of primary and secondary
    sendAssetTransfer({
      xferAsset: AssetID.fromUint64(this.primary_token_id.value),
      assetReceiver: this.admin.value,
      assetAmount: 0,
      assetCloseTo: this.admin.value,
      fee: 1_000,
    });
    sendAssetTransfer({
      xferAsset: AssetID.fromUint64(this.secondary_token_id.value),
      assetReceiver: this.admin.value,
      assetAmount: 0,
      assetCloseTo: this.admin.value,
      fee: 1_000,
    });
    this.minimum_balance.value = TOKEN_MBR * 2;
    /*     const algoToSend = this.app.address.balance - this.minimum_balance.value - 1000;
    sendPayment({
      receiver: this.admin.value,
      amount: algoToSend,
      fee: 1_000,
    }); */
    this.deleteApplication();
  }

  // Prepares the application, including opting in to assets and creating the LP token
  initApplication(
    mbrTxn: PayTxn,
    primaryAssetId: uint64,
    secondaryAssetId: uint64,
    lpAssetName: string,
    lpAssetURL: string,
    swapFeeBps: uint64,
    protocolFeeBps: uint64,
    treasuryAddress: Address
  ): void {
    assert(this.admin.value === this.txn.sender, 'Only admin can initialize the application');

    this.primary_token_reserve.value = 0;
    this.secondary_token_reserve.value = 0;
    this.total_lp_supply.value = 0;
    this.k_value.value = 0;
    this.lp_token_id.value = 0;
    this.lp_token_name.value = lpAssetName;
    this.lp_token_symbol.value = 'MLP';
    this.lp_token_decimals.value = 6;
    this.lp_token_url.value = lpAssetURL;
    this.contract_version.value = VERSION;
    this.minimum_balance.value = TOKEN_MBR * 4;
    this.swap_fee_bps.value = swapFeeBps;
    this.protocol_fee_bps.value = protocolFeeBps;
    this.treasury_address.value = treasuryAddress;

    verifyPayTxn(mbrTxn, { receiver: this.app.address, amount: TOKEN_MBR * 4 + 3_000 });

    this.primary_token_id.value = primaryAssetId;
    this.secondary_token_id.value = secondaryAssetId;

    // opt in to primary and secondary tokens
    sendAssetTransfer({
      xferAsset: AssetID.fromUint64(this.primary_token_id.value),
      assetReceiver: this.app.address,
      assetAmount: 0,
      fee: 1_000,
    });
    sendAssetTransfer({
      xferAsset: AssetID.fromUint64(this.secondary_token_id.value),
      assetReceiver: this.app.address,
      assetAmount: 0,
      fee: 1_000,
    });

    // mint LP tokens
    const lpAssetId = sendAssetCreation({
      configAssetTotal: LP_TOKEN_SUPPLY,
      configAssetDecimals: this.lp_token_decimals.value,
      configAssetName: this.lp_token_name.value,
      configAssetUnitName: this.lp_token_symbol.value,
      configAssetURL: this.lp_token_url.value,
      fee: 1_000,
    }); // 1000 fee covered by sender
    this.lp_token_id.value = lpAssetId.id;
    this.total_lp_supply.value = LP_TOKEN_SUPPLY;
  }

  // Adds liquidity to the pool and mints the appropriate number of LP tokens
  addLiquidity(
    primaryAmount: uint64,
    secondaryAmount: uint64,
    primaryAssetTransfer: AssetTransferTxn,
    secondaryAssetTransfer: AssetTransferTxn
  ): void {
    const primaryReserve = this.primary_token_reserve.value;
    const secondaryReserve = this.secondary_token_reserve.value;
    const totalLPSupply = this.total_lp_supply.value;
    const lpTokensIssued = this.lp_tokens_issued.value;

    // Ensure valid input amounts
    verifyAssetTransferTxn(primaryAssetTransfer, {
      sender: this.txn.sender,
      assetReceiver: this.app.address,
      xferAsset: AssetID.fromUint64(this.primary_token_id.value),
      assetAmount: primaryAmount,
    });
    verifyAssetTransferTxn(secondaryAssetTransfer, {
      sender: this.txn.sender,
      assetReceiver: this.app.address,
      xferAsset: AssetID.fromUint64(this.secondary_token_id.value),
      assetAmount: secondaryAmount,
    });

    let lpTokensMinted: uint64;

    // Case 1: Initial Liquidity
    if (lpTokensIssued === 0) {
      lpTokensMinted = sqrt(primaryAmount * secondaryAmount);
    }
    // Case 2: Adding Liquidity (Matching Pool Ratio)
    else {
      const mintFromPrimary = wideRatio([primaryAmount, totalLPSupply], [primaryReserve]);
      const mintFromSecondary = wideRatio([secondaryAmount * totalLPSupply], [secondaryReserve]);
      lpTokensMinted = this.min(mintFromPrimary, mintFromSecondary);
    }

    // Update the global state for reserves and total LP supply
    this.primary_token_reserve.value = primaryReserve + primaryAmount;
    this.secondary_token_reserve.value = secondaryReserve + secondaryAmount;
    this.total_lp_supply.value = totalLPSupply - lpTokensMinted;
    this.k_value.value = (primaryReserve + primaryAmount) * (secondaryReserve + secondaryAmount);
    this.lp_tokens_issued.value = lpTokensIssued + lpTokensMinted;

    // Mint LP tokens
    sendAssetTransfer({
      xferAsset: AssetID.fromUint64(this.lp_token_id.value),
      assetReceiver: this.txn.sender,
      assetAmount: lpTokensMinted,
    });
  }

  removeLiquidity(burnTxn: AssetTransferTxn, lpTokensBurned: uint64): void {
    const primaryReserve = this.primary_token_reserve.value;
    const secondaryReserve = this.secondary_token_reserve.value;
    const totalLPSupply = this.total_lp_supply.value;

    // Ensure valid LP token balance
    assert(lpTokensBurned > 0, 'Invalid LP amount');
    assert(lpTokensBurned <= totalLPSupply, 'Not enough LP supply');

    verifyAssetTransferTxn(burnTxn, {
      sender: this.txn.sender,
      assetReceiver: this.app.address,
      xferAsset: AssetID.fromUint64(this.lp_token_id.value),
      assetAmount: lpTokensBurned,
    });

    // Calculate how much ORA + ALGO the user gets back
    const primaryWithdrawn = wideRatio([lpTokensBurned, primaryReserve], [totalLPSupply]);
    const secondaryWithdrawn = wideRatio([lpTokensBurned, secondaryReserve], [totalLPSupply]);

    // Update global state (reduce reserves & total LP supply)
    this.primary_token_reserve.value = primaryReserve - primaryWithdrawn;
    this.secondary_token_reserve.value = secondaryReserve - secondaryWithdrawn;
    this.total_lp_supply.value = totalLPSupply - lpTokensBurned;
    this.k_value.value = (primaryReserve - primaryWithdrawn) * (secondaryReserve - secondaryWithdrawn);

    // Burn LP tokens
    this.total_lp_supply.value = this.total_lp_supply.value + lpTokensBurned;
    this.lp_tokens_issued.value = this.lp_tokens_issued.value - lpTokensBurned;

    // Transfer primary and secondary back to user
    if (this.primary_token_id.value !== 0) {
      sendAssetTransfer({
        xferAsset: AssetID.fromUint64(this.primary_token_id.value),
        assetReceiver: this.txn.sender,
        assetAmount: primaryWithdrawn,
      });
    } else {
      sendPayment({
        receiver: this.txn.sender,
        amount: primaryWithdrawn,
      });
    }
    if (this.secondary_token_id.value !== 0) {
      sendAssetTransfer({
        xferAsset: AssetID.fromUint64(this.secondary_token_id.value),
        assetReceiver: this.txn.sender,
        assetAmount: secondaryWithdrawn,
      });
    } else {
      sendPayment({
        receiver: this.txn.sender,
        amount: secondaryWithdrawn,
      });
    }
  }

  // Swap function for swapping between two assets
  // swapType = 0 for Primary -> Secondary, 1 for Secondary -> Primary
  swap(inputAmount: uint64, swapType: uint64): void {
    const primaryReserve = this.primary_token_reserve.value;
    const secondaryReserve = this.secondary_token_reserve.value;
    const swapFeeBps = this.swap_fee_bps.value; // Fee in basis points (bps)
    const protocolFeeBps = this.protocol_fee_bps.value; // Fee in basis points (bps)
    const protocolReceiver = this.treasury_address.value;

    let reserveIn: uint64 = 0;
    let reserveOut: uint64 = 0;

    // Determine if swapping Primary -> Secondary or Secondary -> Primary
    if (swapType === 0) {
      reserveIn = primaryReserve;
      reserveOut = secondaryReserve;
    } else if (swapType === 1) {
      reserveIn = secondaryReserve;
      reserveOut = primaryReserve;
    } else {
      assert(false, 'Invalid swap type');
    }

    // Ensure input is valid
    assert(inputAmount > 0, 'Invalid input amount');

    // Calculate output using constant product formula
    // Calculate total swap fee
    const totalFee = wideRatio([inputAmount, swapFeeBps], [10000]);
    const protocolFee = wideRatio([totalFee, protocolFeeBps], [swapFeeBps]); // Subset of total fee
    const lpFee = totalFee - protocolFee; // Remaining fee goes to LPs

    // Deduct fee from input amount
    const inputAfterFee = inputAmount - totalFee;

    // Calculate output using constant product formula
    const numerator = reserveOut * inputAfterFee;
    const denominator = reserveIn + inputAfterFee;
    const outputAmount = numerator / denominator;

    // Ensure output is valid
    assert(outputAmount > 0, 'Swap too small');

    // Update reserves
    const newReserveIn = reserveIn + inputAfterFee + lpFee;
    const newReserveOut = reserveOut - outputAmount;

    if (swapType === 0) {
      this.primary_token_reserve.value = newReserveIn;
      this.secondary_token_reserve.value = newReserveOut;
    } else {
      this.secondary_token_reserve.value = newReserveIn;
      this.primary_token_reserve.value = newReserveOut;
    }

    // Maintain constant product rule
    this.k_value.value = newReserveIn * newReserveOut;

    // Send protocol fee if applicable
    if (protocolFee > 0) {
      if (swapType === 0) {
        if (this.primary_token_id.value !== 0) {
          sendAssetTransfer({
            xferAsset: AssetID.fromUint64(this.primary_token_id.value),
            assetReceiver: protocolReceiver,
            assetAmount: protocolFee,
          });
        } else {
          sendPayment({
            receiver: protocolReceiver,
            amount: protocolFee,
          });
        }
      } else {
        if (this.secondary_token_id.value !== 0) {
          sendAssetTransfer({
            xferAsset: AssetID.fromUint64(this.secondary_token_id.value),
            assetReceiver: protocolReceiver,
            assetAmount: protocolFee,
          });
        } else {
          sendPayment({
            receiver: protocolReceiver,
            amount: protocolFee,
          });
        }
      }
    }

    // Send output asset to user
    if (swapType === 0) {
      if (this.secondary_token_id.value === 0) {
        sendPayment({
          receiver: this.txn.sender,
          amount: outputAmount,
        });
      } else {
        sendAssetTransfer({
          xferAsset: AssetID.fromUint64(this.secondary_token_id.value),
          assetReceiver: this.txn.sender,
          assetAmount: outputAmount,
        });
      }
    }
    if (swapType === 1) {
      if (this.primary_token_id.value === 0) {
        sendPayment({
          receiver: this.txn.sender,
          amount: outputAmount,
        });
      } else {
        sendAssetTransfer({
          xferAsset: AssetID.fromUint64(this.primary_token_id.value),
          assetReceiver: this.txn.sender,
          assetAmount: outputAmount,
        });
      }
    }
  }

  // Helper function returning the smaller of two values
  private min(a: uint64, b: uint64): uint64 {
    return a < b ? a : b;
  }

  // Admin functions

  // Update the swap fee
  updateSwapFee(newFee: uint64): void {
    assert(this.admin.value === this.txn.sender, 'Only admin can update the swap fee');
    this.swap_fee_bps.value = newFee;
  }

  // Update the protocol fee
  updateProtocolFee(newFee: uint64): void {
    assert(this.admin.value === this.txn.sender, 'Only admin can update the protocol fee');
    this.protocol_fee_bps.value = newFee;
  }

  // Update the admin address
  updateAdmin(newAdmin: Address): void {
    assert(this.admin.value === this.txn.sender, 'Only admin can update the admin address');
    this.admin.value = newAdmin;
  }

  // Update the treasury address
  updateTreasury(newTreasury: Address): void {
    assert(this.admin.value === this.txn.sender, 'Only admin can update the treasury address');
    this.treasury_address.value = newTreasury;
  }

  // Update the minimum balance requirement
  updateMinimumBalance(newMBR: uint64): void {
    assert(this.admin.value === this.txn.sender, 'Only admin can update the minimum balance requirement');
    this.minimum_balance.value = newMBR;
  }

  updateContractEnding(newEnding: uint64): void {
    assert(this.admin.value === this.txn.sender, 'Only admin can update the contract ending');
    this.contract_ending.value = newEnding;
  }
}
