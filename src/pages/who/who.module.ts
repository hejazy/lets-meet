import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { WhoPage } from './who';

@NgModule({
  declarations: [
    WhoPage,
  ],
  imports: [
    IonicPageModule.forChild(WhoPage),
  ],
  exports: [
    WhoPage
  ]
})
export class WhoPageModule {}
