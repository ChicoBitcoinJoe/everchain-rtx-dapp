import { Injectable } from '@angular/core';

import { TokenService } from "../../services/token/token.service";

declare let web3: any;
declare let ethereum: any;
declare let require: any;
let DelegatedWalletArtifact = require('../../artifacts/delegated-wallet/DelegatedWallet.json');
let DelegatedWalletFactoryArtifact = require('../../artifacts/delegated-wallet/DelegatedWalletFactory.json');
let DelegatedWalletManagerArtifact = require('../../artifacts/delegated-wallet/DelegatedWalletManager.json');

export class DelegatedWallet {

  public address: string;
  public name: string;
  public newName: string;
  public tokens = [];
  public tokenList = [];
  public balances: {};
  private storage: any;

  constructor (
    public Tokens: TokenService,
    public contract: any,
  ) {
    this.address = contract._address;
  }

  async rename () {
    if(this.name == this.newName) return;
    if(!this.storage) return;
    await this.storage.syncDone;
    await this.storage.private.set(this.address+'.name', this.newName);
    this.name = this.newName;
  }

  async setBalances (tokenList) {
    this.balances = this.Tokens.getBalances(this.address, tokenList);
  }

  async setTokens (tokens) {
    this.tokens = tokens;
    this.tokenList = [];
    for (let i = 0; i < tokens.length; i++) {
      this.tokenList.push(tokens[i].address);
    }
    this.setBalances(this.tokenList);
  }

  async setStorage (storage) {
    this.storage = storage;
    await this.storage.syncDone;
    let name = await this.storage.private.get(this.address + '.name');
    this.name = name ? name : 'Unnamed Wallet';
    this.newName = this.name;
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

  constructor (
    private Tokens: TokenService
  ) { }

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

  async getWallets (account, options:{ storage:any, tokens:any }) {
    await this.ready;
    let walletArray = await this.manager.methods.getWallets(account).call();
    let wallets = [];
    for (let i = 0; i < walletArray.length; i++) {
      let walletAddress = walletArray[i];
      wallets.push(await this.getWallet(walletAddress, options));
    }
    return wallets;
  }

  async getWallet (walletAddress, options:{ storage:any, tokens:any }) {
    if(!web3.utils.isAddress(walletAddress)) return;
    await this.ready;

    if(!this.wallets[walletAddress]) {
      this.wallets[walletAddress] = new DelegatedWallet(
        this.Tokens,
        new web3.eth.Contract(DelegatedWalletArtifact.abi, walletAddress)
      );
    }

    if(options.storage) this.wallets[walletAddress].setStorage(options.storage);
    if(options.tokens) this.wallets[walletAddress].setTokens(options.tokens);
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
