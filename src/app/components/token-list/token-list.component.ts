import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { Router } from '@angular/router';

import { AppService } from "../../services/app/app.service";
import { UserService } from "../../services/user/user.service";
import { TokenService } from "../../services/token/token.service";
import { WalletService } from "../../services/wallet/wallet.service";

declare let web3: any;

@Component({
  selector: 'app-token-list',
  templateUrl: './token-list.component.html',
  styleUrls: ['./token-list.component.scss']
})
export class TokenListComponent implements OnInit {

  @Input() selectedToken: any;
  @Input() tokens = [];

  constructor (
    private router: Router,
    public App: AppService,
    public User: UserService,
    private Tokens: TokenService,
    private Wallets: WalletService,
  ) { }

  async ngOnInit() {

  }
  
}
