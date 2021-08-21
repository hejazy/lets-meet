import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { ProfilePopupPage } from './profile-popup';

@NgModule({
  declarations: [
    ProfilePopupPage,
  ],
  imports: [
    IonicPageModule.forChild(ProfilePopupPage),
  ],
  exports: [
    ProfilePopupPage
  ]
})
export class ProfilePopupPageModule {}
