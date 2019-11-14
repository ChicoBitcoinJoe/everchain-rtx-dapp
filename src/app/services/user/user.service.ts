import { Injectable } from '@angular/core';

import { TokenService } from "../../services/token/token.service";
import { WalletService } from "../../services/wallet/wallet.service";

declare let web3: any;
declare let ethereum: any;
declare let require: any;
const ThreeBox = require('3box');

@Injectable({
  providedIn: 'root'
})
export class UserService {

  signInPromise: Promise<boolean>;
  isSigningIn: boolean = false;
  isSignedIn: boolean = false;
  address: string;

  storage: any;
  tokenList = [];
  tokens = [];
  wallets = [];
  transactions = [];
  private balances = {};

  constructor (
    private Tokens: TokenService,
    private Wallets: WalletService,
  ) { }

  public signIn () {
    if(this.signInPromise) return this.signInPromise;

    this.signInPromise = new Promise (async (resolve, reject) => {
      this.isSigningIn = true;
      try {
        this.address = (await ethereum.enable())[0];
        this.watchForAccountChanges();
        this.storage = await ThreeBox.openBox(this.address, ethereum);
        this.tokenList = await this.getTokenList();
        this.tokens = await this.Tokens.getTokens(this.tokenList);
        this.balances = await this.Tokens.getBalances(this.address, this.tokenList);
        this.wallets = await this.Wallets.getWallets(this.address, {
         storage: this.storage,
         tokens: this.tokens
        });
        this.isSignedIn = true;
        console.log("Signed in as: ", this);
        resolve(true);
      }
      catch (err) {
        console.error(err);
        reject(err);
      }
      this.isSigningIn = false;
    });

    return this.signInPromise;
  }

  public async createWallet (name: string, etherAmountInWei) {
    let tx:any = await this.Wallets.createWallet(this.address, etherAmountInWei);
    tx.on('receipt', async (txReceipt) => {
      let walletAddress = txReceipt.events.AddWallet_event.returnValues.wallet;
      console.log(txReceipt);
      console.log(walletAddress);
      console.log(name);
      await this.storage.syncDone;
      await this.storage.private.set(walletAddress + '.name', name);
      this.wallets.push(await this.Wallets.getWallet(walletAddress, this.storage));
      console.log('added wallet', walletAddress);
    })
    .on('error', function(err){
      if(err.code != 4001) {
        console.error(err)
      }
    });
    return tx;
  }

  public async addToken (token) {
    console.log('adding', token.name);
    // if(!web3.utils.isAddress(token.address)) return;
    if(this.tokenList.includes(token.address)) return;

    this.tokenList.push(token.address);
    this.tokens.push(token);
    await this.saveTokenList(this.tokenList);
  }

  public async removeToken (token) {
    console.log('removing', token.name);
    if(token.address == "ether") return new Error('cannot remove ether');
    if(!this.tokenList.includes(token.address)) return;
    let index = this.tokenList.indexOf(token.address);
    this.tokenList.splice(index,1);
    this.tokens.splice(index,1);
    await this.saveTokenList(this.tokenList);
  }

  private async saveTokenList (tokenList) {
    await this.storage.syncDone;
    await this.storage.private.set('tokenList', this.tokenList);
  }

  private async watchForAccountChanges () {
    ethereum.on('accountsChanged', function (accounts) {
      // Time to reload your interface with accounts[0]!
      console.log('account change detected', accounts);
      location.reload();
    });
  }

  private async getTokenList () {
    let tokenList = await this.storage.private.get('tokenList');
    return tokenList ? tokenList : this.Tokens.defaultList;
  }

}
