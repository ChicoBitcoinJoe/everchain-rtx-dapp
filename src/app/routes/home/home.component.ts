import { Component, OnInit } from '@angular/core';

import { AppService } from "../../services/app/app.service";
import { TokenService } from "../../services/token/token.service";
import { UserService } from "../../services/user/user.service";

declare let web3: any;

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

  ready: boolean;
  tokenAddress: string;

  constructor (
    public App: AppService,
    public Tokens: TokenService,
    public User: UserService,
  ) { }

  async ngOnInit () {
    try {
      this.ready = await this.App.ready;
    }
    catch (err) {
      console.error(err);
    }
  }

  async addToken () {
    this.User.addToken(await this.Tokens.getToken(this.tokenAddress));
  }

  valid () {
    return web3.utils.isAddress(this.tokenAddress)
  }

}
