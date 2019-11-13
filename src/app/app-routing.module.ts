import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { HomeComponent } from './routes/home/home.component';
import { CreateWalletComponent } from './routes/create-wallet/create-wallet.component';
import { WalletComponent } from './routes/wallet/wallet.component';

const routes: Routes = [
  {
      path: '',
      component: HomeComponent
  },
  {
      path: 'wallet',
      children: [
        {
          path: 'new', component: CreateWalletComponent
        },
        {
          path: ':wallet',
          component: WalletComponent,
          children: [
            {
              path: 'token/:token',
              component: WalletComponent
            }
          ]
        }
      ]
  },
  {
      path: '**',
      redirectTo: '/',
      pathMatch: 'full'
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
