import { Contract } from '@algorandfoundation/tealscript';

// const PRECISION = 1_000_000_000_000_000;
const VERSION = 1000;
const TOKEN_MBR = 100_000;
export class Mamm extends Contract {
  programVersion = 11;

  // Global State
  primary_token_reserve = GlobalStateKey<uint64>({ key: 'ptr' });

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

  admin = GlobalStateKey<Address>({ key: 'admin' });

  minimum_balance = GlobalStateKey<uint64>({ key: 'minbal' });

  contract_version = GlobalStateKey<uint64>({ key: 'version' });

  createApplication(): void {
    this.admin.value = this.txn.sender;
  }

  initApplication(
    mbrTxn: PayTxn,
    primaryAssetId: uint64,
    secondaryAssetId: uint64,
    lpAssetName: string,
    lpAssetURL: string
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
  }

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
      const mintFromOra = (primaryAmount * totalLPSupply) / primaryReserve;
      const mintFromAlgo = (secondaryAmount * totalLPSupply) / secondaryReserve;
      lpTokensMinted = this.min(mintFromOra, mintFromAlgo);
    }

    // Update global state
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
  }

  private min(a: uint64, b: uint64): uint64 {
    return a < b ? a : b;
  }
}

/*

// Function: Add Liquidity
export function addLiquidity(oraAmount: uint64, algoAmount: uint64): void {
    const oraReserve = GLOBAL_STATE.ORA_RESERVE.get();
    const algoReserve = GLOBAL_STATE.ALGO_RESERVE.get();
    const totalLPSupply = GLOBAL_STATE.TOTAL_LP_SUPPLY.get();

    let lpTokensMinted: uint64;

    // Case 1: Initial Liquidity
    if (totalLPSupply == 0) {
        lpTokensMinted = sqrt(oraAmount * algoAmount);
    }
    // Case 2: Adding Liquidity (Matching Pool Ratio)
    else {
        const mintFromOra = (oraAmount * totalLPSupply) / oraReserve;
        const mintFromAlgo = (algoAmount * totalLPSupply) / algoReserve;
        lpTokensMinted = min(mintFromOra, mintFromAlgo);
    }

    // Update global state
    GLOBAL_STATE.ORA_RESERVE.put(oraReserve + oraAmount);
    GLOBAL_STATE.ALGO_RESERVE.put(algoReserve + algoAmount);
    GLOBAL_STATE.TOTAL_LP_SUPPLY.put(totalLPSupply + lpTokensMinted);
    GLOBAL_STATE.K_VALUE.put((oraReserve + oraAmount) * (algoReserve + algoAmount));

    // Mint LP tokens
    mintLPTokens(Txn.sender(), lpTokensMinted);
}

// Function: Mint LP Tokens (Simplified Example)
function mintLPTokens(recipient: Address, amount: uint64): void {
    // Ensure LP token is already created
    const lpTokenID = GLOBAL_STATE.LP_TOKEN_ID.get();
    assert(lpTokenID > 0, "LP Token not initialized");

    sendAsset(recipient, lpTokenID, amount);
}
 */
