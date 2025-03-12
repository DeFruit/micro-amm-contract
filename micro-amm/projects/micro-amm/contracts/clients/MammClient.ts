/* eslint-disable */
/**
 * This file was automatically generated by @algorandfoundation/algokit-client-generator.
 * DO NOT MODIFY IT BY HAND.
 * requires: @algorandfoundation/algokit-utils: ^7
 */
import { AlgorandClientInterface } from '@algorandfoundation/algokit-utils/types/algorand-client-interface'
import { ABIReturn, AppReturn, SendAppTransactionResult } from '@algorandfoundation/algokit-utils/types/app'
import { Arc56Contract, getArc56ReturnValue, getABIStructFromABITuple } from '@algorandfoundation/algokit-utils/types/app-arc56'
import {
  AppClient as _AppClient,
  AppClientMethodCallParams,
  AppClientParams,
  AppClientBareCallParams,
  CallOnComplete,
  AppClientCompilationParams,
  ResolveAppClientByCreatorAndName,
  ResolveAppClientByNetwork,
  CloneAppClientParams,
} from '@algorandfoundation/algokit-utils/types/app-client'
import { AppFactory as _AppFactory, AppFactoryAppClientParams, AppFactoryResolveAppClientByCreatorAndNameParams, AppFactoryDeployParams, AppFactoryParams, CreateSchema } from '@algorandfoundation/algokit-utils/types/app-factory'
import { TransactionComposer, AppCallMethodCall, AppMethodCallTransactionArgument, SimulateOptions, RawSimulateOptions, SkipSignaturesSimulateOptions } from '@algorandfoundation/algokit-utils/types/composer'
import { SendParams, SendSingleTransactionResult, SendAtomicTransactionComposerResults } from '@algorandfoundation/algokit-utils/types/transaction'
import { Address, encodeAddress, modelsv2, OnApplicationComplete, Transaction, TransactionSigner } from 'algosdk'
import SimulateResponse = modelsv2.SimulateResponse

export const APP_SPEC: Arc56Contract = {"name":"Mamm","desc":"","methods":[{"name":"createApplication","args":[],"returns":{"type":"void"},"actions":{"create":["NoOp"],"call":[]}}],"arcs":[4,56],"structs":{},"state":{"schema":{"global":{"bytes":0,"ints":0},"local":{"bytes":0,"ints":0}},"keys":{"global":{},"local":{},"box":{}},"maps":{"global":{},"local":{},"box":{}}},"bareActions":{"create":[],"call":[]},"sourceInfo":{"approval":{"sourceInfo":[{"teal":1,"source":"contracts/Mamm.algo.ts:5","pc":[0]},{"teal":13,"source":"contracts/Mamm.algo.ts:5","pc":[1,2]},{"teal":14,"source":"contracts/Mamm.algo.ts:5","pc":[3]},{"teal":15,"source":"contracts/Mamm.algo.ts:5","pc":[4,5]},{"teal":16,"source":"contracts/Mamm.algo.ts:5","pc":[6]},{"teal":17,"source":"contracts/Mamm.algo.ts:5","pc":[7,8]},{"teal":18,"source":"contracts/Mamm.algo.ts:5","pc":[9]},{"teal":19,"source":"contracts/Mamm.algo.ts:5","pc":[10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35]},{"teal":23,"source":"contracts/Mamm.algo.ts:5","errorMessage":"The requested action is not implemented in this contract. Are you using the correct OnComplete? Did you set your app ID?","pc":[36]},{"teal":26,"source":"contracts/Mamm.algo.ts:5","pc":[37,38]},{"teal":27,"source":"contracts/Mamm.algo.ts:5","pc":[39]},{"teal":30,"source":"contracts/Mamm.algo.ts:5","pc":[40,41,42,43,44,45]},{"teal":31,"source":"contracts/Mamm.algo.ts:5","pc":[46,47,48]},{"teal":32,"source":"contracts/Mamm.algo.ts:5","pc":[49,50,51,52]},{"teal":35,"source":"contracts/Mamm.algo.ts:5","errorMessage":"this contract does not implement the given ABI method for create NoOp","pc":[53]}],"pcOffsetMethod":"none"},"clear":{"sourceInfo":[],"pcOffsetMethod":"none"}},"source":{"approval":"I3ByYWdtYSB2ZXJzaW9uIDExCgovLyBUaGlzIFRFQUwgd2FzIGdlbmVyYXRlZCBieSBURUFMU2NyaXB0IHYwLjEwNi4yCi8vIGh0dHBzOi8vZ2l0aHViLmNvbS9hbGdvcmFuZGZvdW5kYXRpb24vVEVBTFNjcmlwdAoKLy8gVGhpcyBjb250cmFjdCBpcyBjb21wbGlhbnQgd2l0aCBhbmQvb3IgaW1wbGVtZW50cyB0aGUgZm9sbG93aW5nIEFSQ3M6IFsgQVJDNCBdCgovLyBUaGUgZm9sbG93aW5nIHRlbiBsaW5lcyBvZiBURUFMIGhhbmRsZSBpbml0aWFsIHByb2dyYW0gZmxvdwovLyBUaGlzIHBhdHRlcm4gaXMgdXNlZCB0byBtYWtlIGl0IGVhc3kgZm9yIGFueW9uZSB0byBwYXJzZSB0aGUgc3RhcnQgb2YgdGhlIHByb2dyYW0gYW5kIGRldGVybWluZSBpZiBhIHNwZWNpZmljIGFjdGlvbiBpcyBhbGxvd2VkCi8vIEhlcmUsIGFjdGlvbiByZWZlcnMgdG8gdGhlIE9uQ29tcGxldGUgaW4gY29tYmluYXRpb24gd2l0aCB3aGV0aGVyIHRoZSBhcHAgaXMgYmVpbmcgY3JlYXRlZCBvciBjYWxsZWQKLy8gRXZlcnkgcG9zc2libGUgYWN0aW9uIGZvciB0aGlzIGNvbnRyYWN0IGlzIHJlcHJlc2VudGVkIGluIHRoZSBzd2l0Y2ggc3RhdGVtZW50Ci8vIElmIHRoZSBhY3Rpb24gaXMgbm90IGltcGxlbWVudGVkIGluIHRoZSBjb250cmFjdCwgaXRzIHJlc3BlY3RpdmUgYnJhbmNoIHdpbGwgYmUgIipOT1RfSU1QTEVNRU5URUQiIHdoaWNoIGp1c3QgY29udGFpbnMgImVyciIKdHhuIEFwcGxpY2F0aW9uSUQKIQpwdXNoaW50IDYKKgp0eG4gT25Db21wbGV0aW9uCisKc3dpdGNoICpOT1RfSU1QTEVNRU5URUQgKk5PVF9JTVBMRU1FTlRFRCAqTk9UX0lNUExFTUVOVEVEICpOT1RfSU1QTEVNRU5URUQgKk5PVF9JTVBMRU1FTlRFRCAqTk9UX0lNUExFTUVOVEVEICpjcmVhdGVfTm9PcCAqTk9UX0lNUExFTUVOVEVEICpOT1RfSU1QTEVNRU5URUQgKk5PVF9JTVBMRU1FTlRFRCAqTk9UX0lNUExFTUVOVEVEICpOT1RfSU1QTEVNRU5URUQKCipOT1RfSU1QTEVNRU5URUQ6CgkvLyBUaGUgcmVxdWVzdGVkIGFjdGlvbiBpcyBub3QgaW1wbGVtZW50ZWQgaW4gdGhpcyBjb250cmFjdC4gQXJlIHlvdSB1c2luZyB0aGUgY29ycmVjdCBPbkNvbXBsZXRlPyBEaWQgeW91IHNldCB5b3VyIGFwcCBJRD8KCWVycgoKKmFiaV9yb3V0ZV9jcmVhdGVBcHBsaWNhdGlvbjoKCXB1c2hpbnQgMQoJcmV0dXJuCgoqY3JlYXRlX05vT3A6CglwdXNoYnl0ZXMgMHhiODQ0N2IzNiAvLyBtZXRob2QgImNyZWF0ZUFwcGxpY2F0aW9uKCl2b2lkIgoJdHhuYSBBcHBsaWNhdGlvbkFyZ3MgMAoJbWF0Y2ggKmFiaV9yb3V0ZV9jcmVhdGVBcHBsaWNhdGlvbgoKCS8vIHRoaXMgY29udHJhY3QgZG9lcyBub3QgaW1wbGVtZW50IHRoZSBnaXZlbiBBQkkgbWV0aG9kIGZvciBjcmVhdGUgTm9PcAoJZXJy","clear":"I3ByYWdtYSB2ZXJzaW9uIDEx"},"byteCode":{"approval":"CzEYFIEGCzEZCI0MAAAAAAAAAAAAAAAAAAQAAAAAAAAAAAAAAIEBQ4AEuER7NjYaAI4B//AA","clear":"Cw=="},"compilerInfo":{"compiler":"algod","compilerVersion":{"major":4,"minor":0,"patch":2,"commitHash":"6b940281"}}} as unknown as Arc56Contract

/**
 * A state record containing binary data
 */
export interface BinaryState {
  /**
   * Gets the state value as a Uint8Array
   */
  asByteArray(): Uint8Array | undefined
  /**
   * Gets the state value as a string
   */
  asString(): string | undefined
}

class BinaryStateValue implements BinaryState {
  constructor(private value: Uint8Array | undefined) {}

  asByteArray(): Uint8Array | undefined {
    return this.value
  }

  asString(): string | undefined {
    return this.value !== undefined ? Buffer.from(this.value).toString('utf-8') : undefined
  }
}

/**
 * Expands types for IntelliSense so they are more human readable
 * See https://stackoverflow.com/a/69288824
 */
export type Expand<T> = T extends (...args: infer A) => infer R
  ? (...args: Expand<A>) => Expand<R>
  : T extends infer O
    ? { [K in keyof O]: O[K] }
    : never


/**
 * The argument types for the Mamm contract
 */
export type MammArgs = {
  /**
   * The object representation of the arguments for each method
   */
  obj: {
    'createApplication()void': Record<string, never>
  }
  /**
   * The tuple representation of the arguments for each method
   */
  tuple: {
    'createApplication()void': []
  }
}

/**
 * The return type for each method
 */
export type MammReturns = {
  'createApplication()void': void
}

/**
 * Defines the types of available calls and state of the Mamm smart contract.
 */
export type MammTypes = {
  /**
   * Maps method signatures / names to their argument and return types.
   */
  methods:
    & Record<'createApplication()void' | 'createApplication', {
      argsObj: MammArgs['obj']['createApplication()void']
      argsTuple: MammArgs['tuple']['createApplication()void']
      returns: MammReturns['createApplication()void']
    }>
}

/**
 * Defines the possible abi call signatures.
 */
export type MammSignatures = keyof MammTypes['methods']
/**
 * Defines the possible abi call signatures for methods that return a non-void value.
 */
export type MammNonVoidMethodSignatures = keyof MammTypes['methods'] extends infer T ? T extends keyof MammTypes['methods'] ? MethodReturn<T> extends void ? never : T  : never : never
/**
 * Defines an object containing all relevant parameters for a single call to the contract.
 */
export type CallParams<TArgs> = Expand<
  Omit<AppClientMethodCallParams, 'method' | 'args' | 'onComplete'> &
    {
      /** The args for the ABI method call, either as an ordered array or an object */
      args: Expand<TArgs>
    }
>
/**
 * Maps a method signature from the Mamm smart contract to the method's arguments in either tuple or struct form
 */
export type MethodArgs<TSignature extends MammSignatures> = MammTypes['methods'][TSignature]['argsObj' | 'argsTuple']
/**
 * Maps a method signature from the Mamm smart contract to the method's return type
 */
export type MethodReturn<TSignature extends MammSignatures> = MammTypes['methods'][TSignature]['returns']


/**
 * Defines supported create method params for this smart contract
 */
export type MammCreateCallParams =
  | Expand<CallParams<MammArgs['obj']['createApplication()void'] | MammArgs['tuple']['createApplication()void']> & {method: 'createApplication'} & {onComplete?: OnApplicationComplete.NoOpOC} & CreateSchema>
  | Expand<CallParams<MammArgs['obj']['createApplication()void'] | MammArgs['tuple']['createApplication()void']> & {method: 'createApplication()void'} & {onComplete?: OnApplicationComplete.NoOpOC} & CreateSchema>
/**
 * Defines arguments required for the deploy method.
 */
export type MammDeployParams = Expand<Omit<AppFactoryDeployParams, 'createParams' | 'updateParams' | 'deleteParams'> & {
  /**
   * Create transaction parameters to use if a create needs to be issued as part of deployment; use `method` to define ABI call (if available) or leave out for a bare call (if available)
   */
  createParams?: MammCreateCallParams
}>


/**
 * Exposes methods for constructing `AppClient` params objects for ABI calls to the Mamm smart contract
 */
export abstract class MammParamsFactory {
  /**
   * Gets available create ABI call param factories
   */
  static get create() {
    return {
      _resolveByMethod<TParams extends MammCreateCallParams & {method: string}>(params: TParams) {
        switch(params.method) {
          case 'createApplication':
          case 'createApplication()void':
            return MammParamsFactory.create.createApplication(params)
        }
        throw new Error(`Unknown ' + verb + ' method`)
      },

      /**
       * Constructs create ABI call params for the Mamm smart contract using the createApplication()void ABI method
       *
       * @param params Parameters for the call
       * @returns An `AppClientMethodCallParams` object for the call
       */
      createApplication(params: CallParams<MammArgs['obj']['createApplication()void'] | MammArgs['tuple']['createApplication()void']> & AppClientCompilationParams & {onComplete?: OnApplicationComplete.NoOpOC}): AppClientMethodCallParams & AppClientCompilationParams & {onComplete?: OnApplicationComplete.NoOpOC} {
        return {
          ...params,
          method: 'createApplication()void' as const,
          args: Array.isArray(params.args) ? params.args : [],
        }
      },
    }
  }

}

/**
 * A factory to create and deploy one or more instance of the Mamm smart contract and to create one or more app clients to interact with those (or other) app instances
 */
export class MammFactory {
  /**
   * The underlying `AppFactory` for when you want to have more flexibility
   */
  public readonly appFactory: _AppFactory

  /**
   * Creates a new instance of `MammFactory`
   *
   * @param params The parameters to initialise the app factory with
   */
  constructor(params: Omit<AppFactoryParams, 'appSpec'>) {
    this.appFactory = new _AppFactory({
      ...params,
      appSpec: APP_SPEC,
    })
  }
  
  /** The name of the app (from the ARC-32 / ARC-56 app spec or override). */
  public get appName() {
    return this.appFactory.appName
  }
  
  /** The ARC-56 app spec being used */
  get appSpec() {
    return APP_SPEC
  }
  
  /** A reference to the underlying `AlgorandClient` this app factory is using. */
  public get algorand(): AlgorandClientInterface {
    return this.appFactory.algorand
  }
  
  /**
   * Returns a new `AppClient` client for an app instance of the given ID.
   *
   * Automatically populates appName, defaultSender and source maps from the factory
   * if not specified in the params.
   * @param params The parameters to create the app client
   * @returns The `AppClient`
   */
  public getAppClientById(params: AppFactoryAppClientParams) {
    return new MammClient(this.appFactory.getAppClientById(params))
  }
  
  /**
   * Returns a new `AppClient` client, resolving the app by creator address and name
   * using AlgoKit app deployment semantics (i.e. looking for the app creation transaction note).
   *
   * Automatically populates appName, defaultSender and source maps from the factory
   * if not specified in the params.
   * @param params The parameters to create the app client
   * @returns The `AppClient`
   */
  public async getAppClientByCreatorAndName(
    params: AppFactoryResolveAppClientByCreatorAndNameParams,
  ) {
    return new MammClient(await this.appFactory.getAppClientByCreatorAndName(params))
  }

  /**
   * Idempotently deploys the Mamm smart contract.
   *
   * @param params The arguments for the contract calls and any additional parameters for the call
   * @returns The deployment result
   */
  public async deploy(params: MammDeployParams = {}) {
    const result = await this.appFactory.deploy({
      ...params,
      createParams: params.createParams?.method ? MammParamsFactory.create._resolveByMethod(params.createParams) : params.createParams ? params.createParams as (MammCreateCallParams & { args: Uint8Array[] }) : undefined,
    })
    return { result: result.result, appClient: new MammClient(result.appClient) }
  }

  /**
   * Get parameters to create transactions (create and deploy related calls) for the current app. A good mental model for this is that these parameters represent a deferred transaction creation.
   */
  readonly params = {
    /**
     * Gets available create methods
     */
    create: {
      /**
       * Creates a new instance of the Mamm smart contract using the createApplication()void ABI method.
       *
       * @param params The params for the smart contract call
       * @returns The create params
       */
      createApplication: (params: CallParams<MammArgs['obj']['createApplication()void'] | MammArgs['tuple']['createApplication()void']> & AppClientCompilationParams & CreateSchema & {onComplete?: OnApplicationComplete.NoOpOC} = {args: []}) => {
        return this.appFactory.params.create(MammParamsFactory.create.createApplication(params))
      },
    },

  }

  /**
   * Create transactions for the current app
   */
  readonly createTransaction = {
    /**
     * Gets available create methods
     */
    create: {
      /**
       * Creates a new instance of the Mamm smart contract using the createApplication()void ABI method.
       *
       * @param params The params for the smart contract call
       * @returns The create transaction
       */
      createApplication: (params: CallParams<MammArgs['obj']['createApplication()void'] | MammArgs['tuple']['createApplication()void']> & AppClientCompilationParams & CreateSchema & {onComplete?: OnApplicationComplete.NoOpOC} = {args: []}) => {
        return this.appFactory.createTransaction.create(MammParamsFactory.create.createApplication(params))
      },
    },

  }

  /**
   * Send calls to the current app
   */
  readonly send = {
    /**
     * Gets available create methods
     */
    create: {
      /**
       * Creates a new instance of the Mamm smart contract using an ABI method call using the createApplication()void ABI method.
       *
       * @param params The params for the smart contract call
       * @returns The create result
       */
      createApplication: async (params: CallParams<MammArgs['obj']['createApplication()void'] | MammArgs['tuple']['createApplication()void']> & AppClientCompilationParams & CreateSchema & SendParams & {onComplete?: OnApplicationComplete.NoOpOC} = {args: []}) => {
        const result = await this.appFactory.send.create(MammParamsFactory.create.createApplication(params))
        return { result: { ...result.result, return: result.result.return as unknown as (undefined | MammReturns['createApplication()void']) }, appClient: new MammClient(result.appClient) }
      },
    },

  }

}
/**
 * A client to make calls to the Mamm smart contract
 */
export class MammClient {
  /**
   * The underlying `AppClient` for when you want to have more flexibility
   */
  public readonly appClient: _AppClient

  /**
   * Creates a new instance of `MammClient`
   *
   * @param appClient An `AppClient` instance which has been created with the Mamm app spec
   */
  constructor(appClient: _AppClient)
  /**
   * Creates a new instance of `MammClient`
   *
   * @param params The parameters to initialise the app client with
   */
  constructor(params: Omit<AppClientParams, 'appSpec'>)
  constructor(appClientOrParams: _AppClient | Omit<AppClientParams, 'appSpec'>) {
    this.appClient = appClientOrParams instanceof _AppClient ? appClientOrParams : new _AppClient({
      ...appClientOrParams,
      appSpec: APP_SPEC,
    })
  }
  
  /**
   * Checks for decode errors on the given return value and maps the return value to the return type for the given method
   * @returns The typed return value or undefined if there was no value
   */
  decodeReturnValue<TSignature extends MammNonVoidMethodSignatures>(method: TSignature, returnValue: ABIReturn | undefined) {
    return returnValue !== undefined ? getArc56ReturnValue<MethodReturn<TSignature>>(returnValue, this.appClient.getABIMethod(method), APP_SPEC.structs) : undefined
  }
  
  /**
   * Returns a new `MammClient` client, resolving the app by creator address and name
   * using AlgoKit app deployment semantics (i.e. looking for the app creation transaction note).
   * @param params The parameters to create the app client
   */
  public static async fromCreatorAndName(params: Omit<ResolveAppClientByCreatorAndName, 'appSpec'>): Promise<MammClient> {
    return new MammClient(await _AppClient.fromCreatorAndName({...params, appSpec: APP_SPEC}))
  }
  
  /**
   * Returns an `MammClient` instance for the current network based on
   * pre-determined network-specific app IDs specified in the ARC-56 app spec.
   *
   * If no IDs are in the app spec or the network isn't recognised, an error is thrown.
   * @param params The parameters to create the app client
   */
  static async fromNetwork(
    params: Omit<ResolveAppClientByNetwork, 'appSpec'>
  ): Promise<MammClient> {
    return new MammClient(await _AppClient.fromNetwork({...params, appSpec: APP_SPEC}))
  }
  
  /** The ID of the app instance this client is linked to. */
  public get appId() {
    return this.appClient.appId
  }
  
  /** The app address of the app instance this client is linked to. */
  public get appAddress() {
    return this.appClient.appAddress
  }
  
  /** The name of the app. */
  public get appName() {
    return this.appClient.appName
  }
  
  /** The ARC-56 app spec being used */
  public get appSpec() {
    return this.appClient.appSpec
  }
  
  /** A reference to the underlying `AlgorandClient` this app client is using. */
  public get algorand(): AlgorandClientInterface {
    return this.appClient.algorand
  }

  /**
   * Get parameters to create transactions for the current app. A good mental model for this is that these parameters represent a deferred transaction creation.
   */
  readonly params = {
    /**
     * Makes a clear_state call to an existing instance of the Mamm smart contract.
     *
     * @param params The params for the bare (raw) call
     * @returns The clearState result
     */
    clearState: (params?: Expand<AppClientBareCallParams>) => {
      return this.appClient.params.bare.clearState(params)
    },

  }

  /**
   * Create transactions for the current app
   */
  readonly createTransaction = {
    /**
     * Makes a clear_state call to an existing instance of the Mamm smart contract.
     *
     * @param params The params for the bare (raw) call
     * @returns The clearState result
     */
    clearState: (params?: Expand<AppClientBareCallParams>) => {
      return this.appClient.createTransaction.bare.clearState(params)
    },

  }

  /**
   * Send calls to the current app
   */
  readonly send = {
    /**
     * Makes a clear_state call to an existing instance of the Mamm smart contract.
     *
     * @param params The params for the bare (raw) call
     * @returns The clearState result
     */
    clearState: (params?: Expand<AppClientBareCallParams & SendParams>) => {
      return this.appClient.send.bare.clearState(params)
    },

  }

  /**
   * Clone this app client with different params
   *
   * @param params The params to use for the the cloned app client. Omit a param to keep the original value. Set a param to override the original value. Setting to undefined will clear the original value.
   * @returns A new app client with the altered params
   */
  public clone(params: CloneAppClientParams) {
    return new MammClient(this.appClient.clone(params))
  }

  /**
   * Methods to access state for the current Mamm app
   */
  state = {
  }

  public newGroup(): MammComposer {
    const client = this
    const composer = this.algorand.newGroup()
    let promiseChain:Promise<unknown> = Promise.resolve()
    const resultMappers: Array<undefined | ((x: ABIReturn | undefined) => any)> = []
    return {
      /**
       * Add a clear state call to the Mamm contract
       */
      clearState(params: AppClientBareCallParams) {
        promiseChain = promiseChain.then(() => composer.addAppCall(client.params.clearState(params)))
        return this
      },
      addTransaction(txn: Transaction, signer?: TransactionSigner) {
        promiseChain = promiseChain.then(() => composer.addTransaction(txn, signer))
        return this
      },
      async composer() {
        await promiseChain
        return composer
      },
      async simulate(options?: SimulateOptions) {
        await promiseChain
        const result = await (!options ? composer.simulate() : composer.simulate(options))
        return {
          ...result,
          returns: result.returns?.map((val, i) => resultMappers[i] !== undefined ? resultMappers[i]!(val) : val.returnValue)
        }
      },
      async send(params?: SendParams) {
        await promiseChain
        const result = await composer.send(params)
        return {
          ...result,
          returns: result.returns?.map((val, i) => resultMappers[i] !== undefined ? resultMappers[i]!(val) : val.returnValue)
        }
      }
    } as unknown as MammComposer
  }
}
export type MammComposer<TReturns extends [...any[]] = []> = {
  /**
   * Makes a clear_state call to an existing instance of the Mamm smart contract.
   *
   * @param args The arguments for the bare call
   * @returns The typed transaction composer so you can fluently chain multiple calls or call execute to execute all queued up transactions
   */
  clearState(params?: AppClientBareCallParams): MammComposer<[...TReturns, undefined]>

  /**
   * Adds a transaction to the composer
   *
   * @param txn A transaction to add to the transaction group
   * @param signer The optional signer to use when signing this transaction.
   */
  addTransaction(txn: Transaction, signer?: TransactionSigner): MammComposer<TReturns>
  /**
   * Returns the underlying AtomicTransactionComposer instance
   */
  composer(): Promise<TransactionComposer>
  /**
   * Simulates the transaction group and returns the result
   */
  simulate(): Promise<MammComposerResults<TReturns> & { simulateResponse: SimulateResponse }>
  simulate(options: SkipSignaturesSimulateOptions): Promise<MammComposerResults<TReturns> & { simulateResponse: SimulateResponse }>
  simulate(options: RawSimulateOptions): Promise<MammComposerResults<TReturns> & { simulateResponse: SimulateResponse }>
  /**
   * Sends the transaction group to the network and returns the results
   */
  send(params?: SendParams): Promise<MammComposerResults<TReturns>>
}
export type MammComposerResults<TReturns extends [...any[]]> = Expand<SendAtomicTransactionComposerResults & {
  returns: TReturns
}>

