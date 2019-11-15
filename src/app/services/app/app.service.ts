import { Component, Injectable } from '@angular/core';
import { Router } from '@angular/router';

import { TokenService } from "../../services/token/token.service";
import { WalletService } from "../../services/wallet/wallet.service";
import { UserService } from "../../services/user/user.service";

declare let window: any;
declare let ethereum: any;
declare let require: any;
const Web3 = require('web3');
declare let web3: any;
web3.currentProvider.setMaxListeners(300);

let DaiToken = {
  '1': '0x89d24a6b4ccb1b6faa2625fe562bdd9a23260359',
  '42': '0xc4375b7de8af5a38a93548eb8453a498222c4ff2',
}

let WethToken = {
  '1': "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",
  '3': "0xc778417e063141139fce010982780140aa0cd5ab",
  '4': "0xc778417e063141139fce010982780140aa0cd5ab",
  '42': "0xd0a1e359811322d97991e03f863a0c30c2cf029c",
}

@Injectable({
  providedIn: 'root'
})
export class AppService {

  public ready: Promise<boolean>;
  private validNetworks = ['1','42'];
  public networkId: number;
  public networkIsValid: boolean = false;
  public autoSigninEnabled: boolean = false;
  public errors = [];

  constructor(
    private router: Router,
    private Tokens: TokenService,
    private Wallets: WalletService,
    private User: UserService,
  ) {
    this.ready = new Promise(async (resolve, reject) => {
      try {
        this.networkId = await this.connectToWeb3();
        if(!this.networkId) {
          resolve(true);
        }
        else {
          this.networkIsValid = this.validNetworks.includes(this.networkId.toString());
          console.log("Network is", this.networkIsValid ? 'valid' : 'invalid');
          if(this.networkIsValid) {
            await this.Wallets.initialize();
            await this.Tokens.setDefaultTokenList(this.getDefaultTokenList());
            this.autoSignin();
          }
        }
      }
      catch (err) {
        console.error(err);
        this.handleError(err);
      }
      console.log('App Ready!', this);
      resolve(true);
    })
  }

  public async view (walletAddressOrString) {
    if(web3.utils.isAddress(walletAddressOrString))
      this.router.navigateByUrl('/wallet/' + walletAddressOrString);
    else
      this.router.navigateByUrl(walletAddressOrString);

  }

  public handleError (err) {
    console.log('registered:', err)
    this.errors.push(err);
  }

  public enableAutoSignin (enabled) {
    localStorage.setItem('EverchainRTx.autoSignin', enabled);
    this.autoSigninEnabled = enabled;
  }

  private autoSignin () {
    this.autoSigninEnabled = JSON.parse(localStorage.getItem('EverchainRTx.autoSignin'));
    console.log('Automatic sign in is set to ', this.autoSigninEnabled);
    if(this.autoSigninEnabled) this.User.signIn();
  }

  private async connectToWeb3 () {
    if (typeof window.ethereum !== 'undefined' || (typeof window.web3 !== 'undefined')) {
      // Web3 browser user detected. You can now use the provider.
      window.web3 = new Web3(window.ethereum || window.web3.currentProvider);
      window.ethereum.autoRefreshOnNetworkChange = false;
      window.ethereum.on('networkChanged', function (accounts) {
        console.log('network change detected', accounts);
        location.reload();
      });
      return window.ethereum.networkVersion;
    }
    else {
      // Old Way Not Supported
      // How do I know the network before i set the provider?
      // window.web3 = new Web3("https://kovan.infura.io/v3/e49b5318974f466db1c55cb1247f1312");
      // this.networkId = await window.web3.eth.getChainId();
      // console.log(this.networkId);
      return null;
    }
  }

  private getDefaultTokenList () {
    let defaultTokenList = ['ether'];
    let dai = DaiToken[this.networkId];
    let weth = WethToken[this.networkId];
    if(dai) defaultTokenList.push(dai);
    if(weth) defaultTokenList.push(weth);
    return defaultTokenList;
  }

}
