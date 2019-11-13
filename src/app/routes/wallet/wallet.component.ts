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
  walletAddress: string;
  wallet: any;

  showTransferCard: boolean;
  isScheduled: boolean;
  selectedToken: any;
  recipient: any;

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

    this.parseRoute();

    if(this.routeObserver) return;
    this.routeObserver = this.router.events.subscribe(routeChange => {
      if(routeChange instanceof NavigationEnd){
        console.log('current route: ', this.router.url);
        console.log(routeChange.url);
        this.parseRoute();
      }
    });
    this.ready = true;
    // this.depositToken = await this.User.tokenList[0];
  }

  ngOnDestroy () {
    if(this.routeObserver) this.routeObserver.unsubscribe();
  }

  private async parseRoute () {
    let routeArray = this.router.url.split('/');
    this.walletAddress = routeArray[2];
    this.wallet = await this.Wallets.getWallet(this.walletAddress, this.User.data);
    if(routeArray.length >= 5){
      this.selectedToken = await this.Tokens.getToken(routeArray[4]);
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

}
