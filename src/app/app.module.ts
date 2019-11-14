import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FlexLayoutModule } from '@angular/flex-layout';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import {
    MatButtonModule,
    MatCardModule,
    MatCheckboxModule,
    MatDatepickerModule,
    MatDialogModule,
    MatDividerModule,
    MatExpansionModule,
    MatFormFieldModule,
    MatGridListModule,
    MatIconModule,
    MatInputModule,
    MatListModule,
    MatMenuModule,
    MatNativeDateModule,
    MatRadioModule,
    MatSelectModule,
    MatSidenavModule,
    MatSliderModule,
    MatSlideToggleModule,
    MatSnackBarModule,
    MatToolbarModule,
} from '@angular/material';

import { AngularDateTimePickerModule } from 'angular2-datetimepicker';

import { AppRoutingModule } from './app-routing.module';
import { RouterModule } from '@angular/router';

import { AppComponent } from './app.component';
import { ToolbarComponent } from './components/toolbar/toolbar.component';
import { HomeComponent } from './routes/home/home.component';
import { CreateWalletComponent } from './routes/create-wallet/create-wallet.component';
import { WalletComponent } from './routes/wallet/wallet.component';
import { TokenListComponent } from './components/token-list/token-list.component';

import { SigninComponent } from './dialogs/signin/signin.component';
import { TokenButtonComponent } from './components/token-button/token-button.component';

@NgModule({
  declarations: [
    AppComponent,
    ToolbarComponent,
    HomeComponent,
    SigninComponent,
    CreateWalletComponent,
    WalletComponent,
    TokenListComponent,
    TokenButtonComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    FlexLayoutModule,
    FormsModule,
    HttpClientModule,
    MatButtonModule,
    MatCardModule,
    MatCheckboxModule,
    MatDatepickerModule,
    MatDividerModule,
    MatDialogModule,
    MatIconModule,
    MatMenuModule,
    MatNativeDateModule,
    MatSelectModule,
    MatToolbarModule,
    MatInputModule,
    RouterModule,
    AngularDateTimePickerModule,
  ],
  entryComponents: [
    SigninComponent,
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
