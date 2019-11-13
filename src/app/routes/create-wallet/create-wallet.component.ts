import { Component, OnInit, NgZone } from '@angular/core';
import { Router } from '@angular/router';

declare let web3: any;

import { AppService } from "../../services/app/app.service";
import { UserService } from "../../services/user/user.service";
import { WalletService } from "../../services/wallet/wallet.service";

@Component({
  selector: 'app-create-wallet',
  templateUrl: './create-wallet.component.html',
  styleUrls: ['./create-wallet.component.scss']
})
export class CreateWalletComponent implements OnInit {

  ready: boolean = false;
  name: string = "Primary Wallet";
  ether: number = 0;
  rtxDelegate: boolean = true;
  waitingForSignature: boolean = false;
  receivedSignature: boolean = false;
  tx: any;
  txHash: any;
  txReceipt: any;
  signError: any = false;
  deployError: any = false;
  confirmation: boolean = false;
  walletAddress: string;

  constructor(
    private ngZone: NgZone,
    private router: Router,
    public App: AppService,
    public User: UserService,
    public Wallets: WalletService,
  ) { }

  async ngOnInit() {
    this.ready = await this.App.ready;
    if(!this.User.isSignedIn)
      this.App.view('home');
  }

  async createWallet () {
    this.waitingForSignature = true;
    this.signError = false;
    let etherAmount = this.ether;
    if(!etherAmount) etherAmount = 0;
    let etherAmountInWei = web3.utils.toBN(web3.utils.toWei(etherAmount.toString(), 'ether'));
    let tx:any;
    try {
      tx = await this.User.createWallet(this.name, etherAmountInWei);
      tx.on('transactionHash', (txHash) => {
        this.ngZone.run(() => {
          console.log(txHash)
          this.txHash = txHash;
          this.receivedSignature = true;
          this.waitingForSignature = false;
        });
      });
      tx.on('receipt', (txReceipt) => {
        this.ngZone.run(() => {
          console.log(txReceipt);
          this.txReceipt = txReceipt;
          this.walletAddress = this.txReceipt.events.AddWallet_event.returnValues.wallet;
          this.confirmation = true;
        });
      });
      tx.on('error', (err) => {
        this.ngZone.run(() => {
          if(err.code == 4001) {
            this.signError = true;
          }
          else {
            console.error(err);
            this.deployError = true;
          }
          this.waitingForSignature = false;
        });
      });
    }
    catch (err) {
      //console.error(err)
      this.waitingForSignature = false;
    }
  }

  async viewWallet () {
    console.log(this.walletAddress);
    this.router.navigateByUrl('/wallet/' + this.walletAddress);
  }

}
