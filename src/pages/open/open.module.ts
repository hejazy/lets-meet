import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { OpenPage } from './open';

@NgModule({
  declarations: [
    OpenPage,
  ],
  imports: [
    IonicPageModule.forChild(OpenPage),
  ],
  exports: [
    OpenPage
  ]
})
export class OpenPageModule {}
