import { Signer, utils } from 'ethers'
import { bigNumber } from '@vutr/purser-core/utils'
import { isFunction, isTruthy } from './helper'

/*
 * Wallet Abstraction to interact with Ethersjs
 * Checkout Signer Interface of EthersJs
 */
export default class WalletSigner extends Signer {
  _wallet = undefined
  _provider = undefined
  _hook = undefined

  constructor(wallet, provider, addressHook = undefined, type = 'hotwallet') {
    super()
    this._wallet = wallet
    this._provider = provider
    this._hook = addressHook
    this._type = type
  }

  get hookAvailable() {
    return isTruthy(this._hook)
  }

  get provider() {
    return this._provider
  }

  getAddress() {
    return Promise.resolve(this._wallet.address)
  }

  async hook(func) {
    return isFunction(this.hook) ? this._hook(func) : this._hook
  }

  async signMessage(message) {
    const str = await this._wallet.signMessage({ message })
    return str
  }

  async sendTransaction(originaltx) {
    const tx = { ...originaltx }
    tx.gasLimit = bigNumber(tx.gasLimit || 10000000)
    tx.gasPrice = bigNumber(250000000)

    /*
     * Convert purser's payload body to ethersjs transaction-request
     */
    const to = await tx.to
    tx.to = to
    tx.inputData = tx.data
    tx.chainId = parseInt(process.env.REACT_APP_CHAIN_ID, 10)
    delete tx.data

    const nonce = await this._provider.getTransactionCount(this._wallet.address)
    tx.nonce = nonce

    tx.value = bigNumber(tx.value ? tx.value.toString() : '0')
    const resp = await this._wallet.sign(tx)
    const rawTx = utils.parseTransaction(resp)

    if (this._type === 'coldwallet') {
      await this._provider.sendTransaction(resp)
    }

    return this._provider.getTransaction(rawTx.hash).then((tx) => Boolean(tx) && this._provider._wrapTransaction(tx, rawTx.hash))
  }
}
