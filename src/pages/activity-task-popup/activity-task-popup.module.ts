import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { ActivityTaskPopupPage } from './activity-task-popup';

@NgModule({
  declarations: [
    ActivityTaskPopupPage,
  ],
  imports: [
    IonicPageModule.forChild(ActivityTaskPopupPage),
  ],
  exports: [
    ActivityTaskPopupPage
  ]
})
export class ActivityTaskPopupPageModule {}
