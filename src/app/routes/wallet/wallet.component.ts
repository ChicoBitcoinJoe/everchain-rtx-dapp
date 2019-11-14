import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';

import { AppService } from "../../services/app/app.service";
import { UserService } from "../../services/user/user.service";
import { WalletService } from "../../services/wallet/wallet.service";
import { TokenService } from "../../services/token/token.service";

@Component({
  selector: 'app-wallet',
  templateUrl: './wallet.component.html',
  styleUrls: ['./wallet.component.scss']
})
export class WalletComponent implements OnInit, OnDestroy {

  ready: boolean;

  routeObserver: any;
  selectedWallet: string;
  wallet: any;

  showTransferCard: boolean;
  isScheduled: boolean;
  selectedToken: any;
  recipient: any;

  showingAddTokenCard: boolean = false;
  tokenAddress: string;
  newToken: any;
  newTokenBalance: any;
  valid: boolean = false;

  date: Date;
  settings = {
    bigBanner: true,
    timePicker: true,
    format: 'MMMM dd, yyyy @ hh:mm a',
    defaultOpen: false
  };

  intervalValue: number = 1;
  intervalUnit: string = 'month';
  depositAmount: number = 1.00;
  depositToken: 'ether';

  constructor(
    public router: Router,
    public App: AppService,
    public User: UserService,
    public Tokens: TokenService,
    public Wallets: WalletService,
  ) { }

  async ngOnInit() {
    await this.App.ready;

    if(!this.routeObserver) {
      this.routeObserver = this.router.events.subscribe(routeChange => {
        if(routeChange instanceof NavigationEnd){
          this.parseRoute();
        }
      });
    };

    await this.parseRoute();
    this.ready = true;
    this.depositToken = await this.User.tokens[0];
  }

  ngOnDestroy () {
    if(this.routeObserver) this.routeObserver.unsubscribe();
  }

  private async parseRoute () {
    let routeArray = this.router.url.split('/');
    this.selectedWallet = routeArray[2];
    this.wallet = await this.Wallets.getWallet(this.selectedWallet, {
      storage: this.User.isSignedIn ? this.User.storage : null,
      tokens: this.User.isSignedIn ?
        await this.Tokens.getTokens(this.User.tokenList) :
        this.Tokens.defaultTokens
    });

    if(routeArray.length >= 5){
      //this.selectedToken = await this.Tokens.getToken(routeArray[4]);
      this.selectedToken = routeArray[4];
      console.log(this.selectedToken)
    }
  }

  startTransfer () {
    this.showTransferCard = true;
  }

  startSchedule () {
    this.isScheduled = true;
  }

  endTransfer () {
    this.showTransferCard = false;
  }

  endSchedule () {
    this.isScheduled = false;
  }

  public selectToken (token) {
    if(this.selectedToken == token.address){
      this.selectedToken = null;
      this.router.navigate(['wallet', this.selectedWallet]);
    }
    else {
      this.selectedToken = token.address;
      this.router.navigate(['wallet', this.selectedWallet, 'token', this.selectedToken]);
    }
  }

  public select (token) {

    this.selectedWallet = this.router.url.split('/')[2];
    if(!this.selectedToken) {
      this.selectedToken = token;
      console.log(['wallet', this.selectedWallet, 'token', token.address]);

      return;
    }
    else if(this.selectedToken.address == token.address) {
      this.selectedToken = null;
      this.router.navigate(['wallet', this.selectedWallet]);
      return;
    }
  }

  async onTokenAddressChange () {
    this.newToken = null;
    this.selectedWallet = this.router.url.split('/')[2];
    try {
      if(!web3.utils.isAddress(this.tokenAddress)) return;
      console.log(this.tokenAddress);
      console.log(this.selectedWallet);
      this.newToken = await this.Tokens.getToken(this.tokenAddress);
      let balanceInWei = await this.newToken.methods.balanceOf(this.selectedWallet).call();
      this.newTokenBalance = web3.utils.fromWei(balanceInWei, 'ether');
      console.log(this.newTokenBalance);
      this.valid = true;
    }
    catch (err) {
      //console.error(err);
      this.valid = false;
    }
  }

  async addToken () {
    if(!this.newToken) return;
    this.User.addToken(this.newToken);
    this.showingAddTokenCard = false;
    this.router.navigate(['wallet', this.selectedWallet, 'token', this.newToken.address]);
  }

  async remove(token) {
    this.User.removeToken(token);
    if(this.selectedToken == token.address)
      this.selectedToken = 'ether';
  }

}
