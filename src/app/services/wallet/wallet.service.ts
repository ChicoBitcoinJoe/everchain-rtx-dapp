import { Injectable } from '@angular/core';

declare let web3: any;
declare let ethereum: any;
declare let require: any;
let DelegatedWalletArtifact = require('../../artifacts/delegated-wallet/DelegatedWallet.json');
let DelegatedWalletFactoryArtifact = require('../../artifacts/delegated-wallet/DelegatedWalletFactory.json');
let DelegatedWalletManagerArtifact = require('../../artifacts/delegated-wallet/DelegatedWalletManager.json');

export class DelegatedWallet {

  ready: Promise<boolean>;
  contract: any;
  name: string;
  tokens = [];

  constructor (
    public address: string,
    public data: any,
  ) {
    this.ready = new Promise (async (resolve,reject) => {
      this.contract = new web3.eth.Contract(DelegatedWalletArtifact.abi, this.address);
      this.name = await this.data.private.get(this.address+'.name');
      resolve(true);
    })
  }

  async rename (name) {
    await this.data.private.set(this.address+'.name');
    this.name = name;
  }

  setTokenList (tokenList) {
    this.tokens = tokenList;
  }

  async balanceOf (token) {
    let balance = await token.methods.balanceOf(this.address).call();
    token['balance'] = balance;
    return balance;
  }

}

@Injectable({
  providedIn: 'root'
})
export class WalletService {

  public ready: Promise<boolean>;
  private factory: any;
  private manager: any;
  private wallets = {};

  constructor () {

  }

  async initialize () {
    if(this.ready) return this.ready;

    this.ready = new Promise(async (resolve, reject) => {
      try {
        let factoryABI = DelegatedWalletFactoryArtifact.abi;
        let factoryAddress = DelegatedWalletFactoryArtifact.networks[ethereum.networkVersion].address;
        this.factory = await new web3.eth.Contract(factoryABI, factoryAddress);
        let managerABI = DelegatedWalletManagerArtifact.abi;
        let managerAddress = DelegatedWalletManagerArtifact.networks[ethereum.networkVersion].address;
        this.manager = await new web3.eth.Contract(managerABI, managerAddress);
        resolve(true);
      }
      catch (err) {
        reject(err);
      }
    });

    return this.ready;
  }

  async getWallets (account, data) {
    await this.ready;
    let walletArray = await this.manager.methods.getWallets(account).call();
    let wallets = [];
    for (let i = 0; i < walletArray.length; i++) {
      let walletAddress = walletArray[i];
      wallets.push(await this.getWallet(walletAddress, data));
    }
    return wallets;
  }

  async getWallet (walletAddress, data) {
    await this.ready;
    if(this.wallets[walletAddress]) return this.wallets[walletAddress];
    this.wallets[walletAddress] = new DelegatedWallet(walletAddress, data);
    return this.wallets[walletAddress];
  }

  public async createWallet (owner: string, etherAmountInWei) {
    await this.ready;
    if(!etherAmountInWei) etherAmountInWei = web3.utils.toBN('0');
    if(!web3.utils.isAddress(owner)) return new Error('owner is not an address');
    if(!web3.utils.isBN(etherAmountInWei)) return new Error('etherAmountInWei is not a big number');
    return await this.manager.methods.createWallet(this.factory._address, []).send({from: owner, value: etherAmountInWei});
  }

}
