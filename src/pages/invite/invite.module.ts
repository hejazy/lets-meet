import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { InvitePage } from './invite';

@NgModule({
  declarations: [
    InvitePage,
  ],
  imports: [
    IonicPageModule.forChild(InvitePage),
  ],
  exports: [
    InvitePage
  ]
})
export class InvitePageModule {}
