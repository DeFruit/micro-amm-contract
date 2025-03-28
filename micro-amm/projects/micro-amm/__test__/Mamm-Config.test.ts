import { describe, test, expect, beforeAll, beforeEach } from '@jest/globals';
import { algorandFixture } from '@algorandfoundation/algokit-utils/testing';
import { AlgorandClient, algos } from '@algorandfoundation/algokit-utils';
import * as algokit from '@algorandfoundation/algokit-utils';
import { TransactionSignerAccount } from '@algorandfoundation/algokit-utils/types/account';
import { consoleLogger } from '@algorandfoundation/algokit-utils/types/logging';
import { MammClient, MammFactory } from '../contracts/clients/MammClient';

const fixture = algorandFixture();
algokit.Config.configure({ populateAppCallResources: true });

let mammClient: MammClient;

const LP_TOKEN_SUPPLY = 99_999_999_999_999n;
const LP_TOKEN_DECIMALS = 6n;
const LP_TOKEN_URL = 'https://lp-asset-url.com';
const LP_TOKEN_NAME = 'LP-Asset';
const SWAP_FEE_BPS = 30n;
const PROTOCOL_FEE_BPS = 5n;

// Environment clients ------------------------------------
let algorand: algokit.AlgorandClient;
//--------------------------------------------------------
// Relevant user accounts ------------------------------------
let deployerAccount: TransactionSignerAccount;
let secondaryAdminAccount: TransactionSignerAccount;
let treasuryAccount: TransactionSignerAccount;
//--------------------------------------------------------
// Relevant assets -------------------------------------------
let primaryAssetId: bigint;
let secondaryAssetId: bigint;
//--------------------------------------------------------

describe('Mamm config testing', () => {
  beforeEach(fixture.newScope);

  beforeAll(async () => {
    await fixture.newScope();
    algorand = AlgorandClient.fromEnvironment();

    // Setup relevant accounts and addresses ----------------
    deployerAccount = await algorand.account.kmd.getOrCreateWalletAccount('deployer-account', algos(100));
    algorand.account.setSignerFromAccount(deployerAccount);
    await algorand.account.ensureFundedFromEnvironment(deployerAccount.addr, algokit.algos(100));

    treasuryAccount = await algorand.account.kmd.getOrCreateWalletAccount('treasury-account', algos(100));
    algorand.account.setSignerFromAccount(treasuryAccount);
    await algorand.account.ensureFundedFromEnvironment(treasuryAccount.addr, algokit.algos(10));

    const deployerInfo = await algorand.account.getInformation(deployerAccount.addr);
    const treasuryInfo = await algorand.account.getInformation(treasuryAccount.addr);
    consoleLogger.debug('deployer account balance', deployerInfo.balance.microAlgos);
    consoleLogger.debug('treasury account balance', treasuryInfo.balance.microAlgos);
    expect(deployerInfo.balance.microAlgos).toBeGreaterThan(0);
    expect(treasuryInfo.balance.microAlgos).toBeGreaterThan(0);

    // Create assets -----------------------------------------
    const primaryCreateTxn = await algorand.send.assetCreate({
      sender: deployerAccount.addr,
      total: 1_000_000n,
      decimals: 6,
      defaultFrozen: false,
      unitName: 'PRM',
      assetName: 'Primary Asset',
      url: 'https://primary-asset-url.com',
    });
    primaryAssetId = primaryCreateTxn.assetId;

    const secondaryCreateTxn = await algorand.send.assetCreate({
      sender: deployerAccount.addr,
      total: 1_000_000n,
      decimals: 6,
      defaultFrozen: false,
      unitName: 'SEC',
      assetName: 'Secondary Asset',
      url: 'https://secondary-asset-url.com',
    });
    secondaryAssetId = secondaryCreateTxn.assetId;

    // Setup app clients -------------------------------------
    const factory = algorand.client.getTypedAppFactory(MammFactory, { defaultSender: deployerAccount.addr });

    const { appClient } = await factory.send.create.createApplication({
      args: [],
      sender: deployerAccount.addr,
    });

    mammClient = appClient;
  });

  test('Mamm client should be created', async () => {
    expect(mammClient).toBeDefined();
  });

  test('init contract', async () => {
    const mbrTxn = algorand.createTransaction.payment({
      sender: deployerAccount.addr,
      receiver: mammClient.appAddress,
      amount: algokit.microAlgos(403_000),
    });
    await mammClient.send.initApplication({
      args: {
        mbrTxn,
        primaryAssetId,
        secondaryAssetId,
        lpAssetName: 'LP-Asset',
        lpAssetUrl: 'https://lp-asset-url.com',
        swapFeeBps: 30,
        protocolFeeBps: 5,
        treasuryAddress: treasuryAccount.addr.toString(),
      },
    });
    const globalState = await mammClient.state.global.getAll();
    expect(globalState.primaryTokenReserve).toBe(0n);
    expect(globalState.secondaryTokenReserve).toBe(0n);
    expect(globalState.totalLpSupply).toBe(LP_TOKEN_SUPPLY);
    expect(globalState.kValue).toBe(0n);
    expect(globalState.lpTokenId).toBeGreaterThan(0n);
    expect(globalState.lpTokenName).toBe(LP_TOKEN_NAME);
    expect(globalState.lpTokenSymbol).toBe('MLP');
    expect(globalState.lpTokenDecimals).toBe(LP_TOKEN_DECIMALS);
    expect(globalState.lpTokenUrl).toBe(LP_TOKEN_URL);
    expect(globalState.contractVersion).toBe(1000n);
    expect(globalState.minimumBalance).toBe(400_000n);
    expect(globalState.swapFeeBps).toBe(SWAP_FEE_BPS);
    expect(globalState.protocolFeeBps).toBe(PROTOCOL_FEE_BPS);
    expect(globalState.treasuryAddress).toBe(treasuryAccount.addr.toString());
  });

  test('Update protocol fee', async () => {
    await mammClient.send.updateProtocolFee({ args: { newFee: 10n } });
    const globalState = await mammClient.state.global.getAll();
    expect(globalState.protocolFeeBps).toBe(10n);
  });

  test('Update protocol fee as non admin', async () => {
    const nonAdminAccount = await algorand.account.kmd.getOrCreateWalletAccount('non-admin-account', algos(100));
    algorand.account.setSignerFromAccount(nonAdminAccount);
    await expect(
      mammClient.send.updateProtocolFee({ args: { newFee: 10n }, sender: nonAdminAccount.addr })
    ).rejects.toThrowError();
  });

  test('Update swap fee', async () => {
    await mammClient.send.updateSwapFee({ args: { newFee: 10n } });
    const globalState = await mammClient.state.global.getAll();
    expect(globalState.swapFeeBps).toBe(10n);
  });

  test('Update swap fee as non admin', async () => {
    const nonAdminAccount = await algorand.account.kmd.getOrCreateWalletAccount('non-admin-account', algos(100));
    algorand.account.setSignerFromAccount(nonAdminAccount);
    await expect(
      mammClient.send.updateSwapFee({ args: { newFee: 10n }, sender: nonAdminAccount.addr })
    ).rejects.toThrowError();
  });

  test('Update treasury address', async () => {
    const newTreasuryAccount = await algorand.account.kmd.getOrCreateWalletAccount('new-treasury-account', algos(100));
    await mammClient.send.updateTreasury({
      args: { newTreasury: newTreasuryAccount.addr.toString() },
      sender: deployerAccount.addr,
    });
    const globalState = await mammClient.state.global.getAll();
    expect(globalState.treasuryAddress).toBe(newTreasuryAccount.addr.toString());
  });

  test('Update treasury address as non admin', async () => {
    const nonAdminAccount = await algorand.account.kmd.getOrCreateWalletAccount('non-admin-account', algos(100));
    algorand.account.setSignerFromAccount(nonAdminAccount);

    algorand.account.setSignerFromAccount(nonAdminAccount);
    await expect(
      mammClient.send.updateTreasury({
        args: { newTreasury: nonAdminAccount.addr.toString() },
        sender: nonAdminAccount.addr,
      })
    ).rejects.toThrowError();
  });

  test('Update minimum balance', async () => {
    await mammClient.send.updateMinimumBalance({ args: { newMbr: 1_000n } });
    const globalState = await mammClient.state.global.getAll();
    expect(globalState.minimumBalance).toBe(1_000n);
  });

  test('Update minimum balance as non admin', async () => {
    const nonAdminAccount = await algorand.account.kmd.getOrCreateWalletAccount('non-admin-account', algos(100));
    algorand.account.setSignerFromAccount(nonAdminAccount);

    await expect(
      mammClient.send.updateMinimumBalance({ args: { newMbr: 1_000n }, sender: nonAdminAccount.addr })
    ).rejects.toThrowError();
  });

  test('update admin non admin account', async () => {
    const nonAdminAccount = await algorand.account.kmd.getOrCreateWalletAccount('non-admin-account', algos(100));
    algorand.account.setSignerFromAccount(nonAdminAccount);
    await expect(
      mammClient.send.updateAdmin({ args: { newAdmin: nonAdminAccount.addr.toString() }, sender: nonAdminAccount.addr })
    ).rejects.toThrowError();
  });

  test('update admin', async () => {
    secondaryAdminAccount = await algorand.account.kmd.getOrCreateWalletAccount('new-admin-account', algos(100));
    algorand.account.setSignerFromAccount(secondaryAdminAccount);
    algorand.account.setDefaultSigner(secondaryAdminAccount);
    await mammClient.send.updateAdmin({
      args: { newAdmin: secondaryAdminAccount.addr.toString() },
      sender: deployerAccount.addr,
    });
    const globalState = await mammClient.state.global.getAll();
    expect(globalState.admin).toBe(secondaryAdminAccount.addr.toString());
  });

  test.skip('delete application', async () => {
    await mammClient.send.updateContractEnding({ args: { newEnding: 1n }, sender: secondaryAdminAccount.addr });
    const globalState = await mammClient.state.global.getAll();
    expect(globalState.contractEnding).toBe(1n);
    await mammClient.send.delete.deleteApplication({ args: {}, sender: secondaryAdminAccount.addr });
    await expect(mammClient.state.global.getAll()).rejects.toThrowError();
  });
});
