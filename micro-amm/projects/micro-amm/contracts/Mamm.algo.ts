/* eslint-disable no-lonely-if */
// This file implements a Micro-AMM (Automated Market Maker) contract on Algorand using TEALScript

import { Contract } from '@algorandfoundation/tealscript';

// The contract's version (used for tracking upgrades)
const VERSION = 1000;

// The minimum balance requirement for holding tokens
const TOKEN_MBR = 100_000;

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

  k_value = GlobalStateKey<uint64>({ key: 'k' });

  lp_token_id = GlobalStateKey<uint64>({ key: 'lp' });

  lp_token_name = GlobalStateKey<string>({ key: 'lpn' });

  lp_token_symbol = GlobalStateKey<string>({ key: 'lps' });

  lp_token_decimals = GlobalStateKey<uint64>({ key: 'lpd' });

  lp_token_url = GlobalStateKey<string>({ key: 'lpu' });

  swap_fee_bps = GlobalStateKey<uint64>({ key: 'sfbps' });

  protocol_fee_bps = GlobalStateKey<uint64>({ key: 'pfbps' });

  admin = GlobalStateKey<Address>({ key: 'admin' });

  treasury_address = GlobalStateKey<Address>({ key: 'treasury' });

  minimum_balance = GlobalStateKey<uint64>({ key: 'minbal' });

  contract_version = GlobalStateKey<uint64>({ key: 'version' });

  // Initializes admin to the creator of the application
  createApplication(): void {
    this.admin.value = this.txn.sender;
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
    this.minimum_balance.value = TOKEN_MBR * 3;
    this.swap_fee_bps.value = swapFeeBps;
    this.protocol_fee_bps.value = protocolFeeBps;
    this.treasury_address.value = treasuryAddress;

    verifyPayTxn(mbrTxn, { receiver: this.app.address, amount: TOKEN_MBR * 3 });

    this.primary_token_id.value = primaryAssetId;
    this.secondary_token_id.value = secondaryAssetId;

    // opt in to primary and secondary tokens
    sendAssetTransfer({
      xferAsset: AssetID.fromUint64(this.primary_token_id.value),
      assetReceiver: this.app.address,
      assetAmount: 0,
    });
    sendAssetTransfer({
      xferAsset: AssetID.fromUint64(this.secondary_token_id.value),
      assetReceiver: this.app.address,
      assetAmount: 0,
    });

    // mint LP tokens
    const lpAssetId = sendAssetCreation({
      configAssetTotal: 99_999_999_999_999,
      configAssetDecimals: this.lp_token_decimals.value,
      configAssetName: this.lp_token_name.value,
      configAssetUnitName: this.lp_token_symbol.value,
      configAssetURL: this.lp_token_url.value,
    }); // 1000 fee covered by sender
    this.lp_token_id.value = lpAssetId.id;
    this.total_lp_supply.value = 99_999_999_999_999;
  }

  // Adds liquidity to the pool and mints the appropriate number of LP tokens
  addLiquidity(primaryAmount: uint64, secondaryAmount: uint64): void {
    const primaryReserve = this.primary_token_reserve.value;
    const secondaryReserve = this.secondary_token_reserve.value;
    const totalLPSupply = this.total_lp_supply.value;

    let lpTokensMinted: uint64;

    // Case 1: Initial Liquidity
    if (totalLPSupply === 0) {
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
    this.total_lp_supply.value = totalLPSupply + lpTokensMinted;
    this.k_value.value = (primaryReserve + primaryAmount) * (secondaryReserve + secondaryAmount);

    // Mint LP tokens
    sendAssetTransfer({
      xferAsset: AssetID.fromUint64(this.lp_token_id.value),
      assetReceiver: this.txn.sender,
      assetAmount: lpTokensMinted,
    });
    this.total_lp_supply.value = this.total_lp_supply.value - lpTokensMinted;
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
}

/* import { GlobalState, Application, GlobalStateKey, Txn, uint64 } from '@algo-builder/tealscript';

// Function: Swap ORA ⇄ ALGO with Fees
export function swap(inputAmount: uint64, swapType: string): void {

    let reserveIn: uint64;
    let reserveOut: uint64;

    // Determine swap type
    if (swapType == "ORA_TO_ALGO") {
        reserveIn = oraReserve;
        reserveOut = algoReserve;
    } else if (swapType == "ALGO_TO_ORA") {
        reserveIn = algoReserve;
        reserveOut = oraReserve;
    } else {
        assert(false, "Invalid swap type");
    }

    // Ensure input is valid
    assert(inputAmount > 0, "Invalid input amount");

    // Calculate total swap fee
    const totalFee = (inputAmount * swapFeeBps) / 10000;
    const protocolFee = (totalFee * protocolFeeBps) / swapFeeBps;  // Subset of total fee
    const lpFee = totalFee - protocolFee;  // Remaining fee goes to LPs

    // Deduct fee from input amount
    const inputAfterFee = inputAmount - totalFee;

    // Calculate output using constant product formula
    const numerator = reserveOut * inputAfterFee;
    const denominator = reserveIn + inputAfterFee;
    const outputAmount = numerator / denominator;

    // Ensure valid output
    assert(outputAmount > 0, "Swap too small");

    // Update reserves
    const newReserveIn = reserveIn + inputAfterFee + lpFee;  // LP fee stays in pool
    const newReserveOut = reserveOut - outputAmount;

    if (swapType == "ORA_TO_ALGO") {
        GLOBAL_STATE.ORA_RESERVE.put(newReserveIn);
        GLOBAL_STATE.ALGO_RESERVE.put(newReserveOut);
    } else {
        GLOBAL_STATE.ALGO_RESERVE.put(newReserveIn);
        GLOBAL_STATE.ORA_RESERVE.put(newReserveOut);
    }

    // Maintain constant product rule
    GLOBAL_STATE.K_VALUE.put(newReserveIn * newReserveOut);

    // Send protocol fee if applicable
    if (protocolFee > 0) {
        if (swapType == "ORA_TO_ALGO") {
            sendAsset(protocolReceiver, GLOBAL_STATE.LP_TOKEN_ID.get(), protocolFee);
        } else {
            sendAlgo(protocolReceiver, protocolFee);
        }
    }

    // Send swapped asset to user
    if (swapType == "ORA_TO_ALGO") {
        sendAlgo(Txn.sender(), outputAmount);
    } else {
        sendAsset(Txn.sender(), GLOBAL_STATE.LP_TOKEN_ID.get(), outputAmount);
    }
}
 */
