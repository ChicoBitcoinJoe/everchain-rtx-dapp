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

  data: any;
  tokenList = [];
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
        this.data = await ThreeBox.openBox(this.address, ethereum);
        this.tokenList = await this.getTokenList();
        this.balances = await this.Tokens.getBalances(this.address, this.tokenList);
        this.wallets = await this.Wallets.getWallets(this.address, this.data);
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
      await this.data.syncDone;
      await this.data.private.set(walletAddress + '.name', name);
      this.wallets.push(await this.Wallets.getWallet(walletAddress, this.data));
      console.log('added wallet', walletAddress);
    })
    .on('error', function(err){
      if(err.code != 4001) {
        console.error(err)
      }
    });
    return tx;
  }

  public addToken (token) {
    // if(!web3.utils.isAddress(token.address)) return;
    // if(!this.tokenList.includes(token.address)) this.tokenList.push(token.address);
  }

  public removeToken (token) {
    // if(!web3.utils.isAddress(token)) return;
    // this.tokens.splice(this.tokens.indexOf(token),1);
  }

  public async balanceOf (token) {
    if(this.balances[token.address])
    this.balances[token.address] = await token.balanceOf(this.address);
    return this.balances[token.address];
  }

  private async watchForAccountChanges () {
    ethereum.on('accountsChanged', function (accounts) {
      // Time to reload your interface with accounts[0]!
      console.log('account change detected', accounts);
      location.reload();
    });
  }

  private async getTokenList () {
    let tokenList = await this.data.private.get('tokenList');
    return tokenList ? tokenList : this.Tokens.defaultList;
  }

  private async getSpace (space) {
    await this.data.syncDone;
    return this.data.openSpace(space);
  }

}
