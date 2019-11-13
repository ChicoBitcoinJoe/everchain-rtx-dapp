import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';

declare let web3: any;

import { AppService } from "../../services/app/app.service";
import { UserService } from "../../services/user/user.service";

@Component({
  selector: 'app-signin',
  templateUrl: './signin.component.html',
  styleUrls: ['./signin.component.scss']
})
export class SigninComponent implements OnInit {

  autoSignin: boolean = false;
  waitingForSignature: boolean;

  constructor(
    public dialogRef: MatDialogRef<SigninComponent>,
    private router: Router,
    public App: AppService,
    public User: UserService
  ) { }

  async ngOnInit () { }

  async signIn () {
    this.waitingForSignature = true;
    this.App.enableAutoSignin(this.autoSignin);
    try {
      await this.User.signIn();
      this.dialogRef.close();
    }
    catch (err) {
      console.error(err);
      this.App.handleError(err);
    }
    this.waitingForSignature = false;
  }

}
