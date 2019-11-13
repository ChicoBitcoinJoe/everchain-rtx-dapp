import { Component, OnInit } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';

import { AppService } from "../../services/app/app.service";
import { UserService } from "../../services/user/user.service";

import { SigninComponent } from "../../dialogs/signin/signin.component";

declare let web3: any;

@Component({
  selector: 'app-toolbar',
  templateUrl: './toolbar.component.html',
  styleUrls: ['./toolbar.component.scss']
})
export class ToolbarComponent implements OnInit {

  ready: boolean;

  constructor(
    public dialog: MatDialog,
    public App: AppService,
    public User: UserService,
  ) {

  }

  async ngOnInit() {
    this.ready = await this.App.ready;
  }

  openSigninDialog () {
    const dialogRef = this.dialog.open(SigninComponent, {});
    dialogRef.afterClosed().subscribe(result => {});
  }

}
