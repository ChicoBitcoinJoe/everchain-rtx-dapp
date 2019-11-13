import { Component, OnInit } from '@angular/core';

import { AppService } from "./services/app/app.service";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {

  constructor(
    public App: AppService
  ) { }

  async ngOnInit () {
    try {
      await this.App.ready;
    }
    catch (err) {
      console.error(err);
      this.App.errors.push(err);
    }
  }

}
