import { Component, OnInit } from '@angular/core';

import { AppService } from "../../services/app/app.service";
import { TokenService } from "../../services/token/token.service";
import { UserService } from "../../services/user/user.service";

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

  ready: boolean;

  constructor (
    public App: AppService,
    private Tokens: TokenService,
    private User: UserService,
  ) { }

  async ngOnInit () {
    try {
      this.ready = await this.App.ready;
    }
    catch (err) {
      console.error(err);
    }
  }

}
