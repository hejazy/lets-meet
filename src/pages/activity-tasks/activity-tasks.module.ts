import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { ActivityTasksPage } from './activity-tasks';

@NgModule({
  declarations: [
    ActivityTasksPage,
  ],
  imports: [
    IonicPageModule.forChild(ActivityTasksPage),
  ],
  exports: [
    ActivityTasksPage
  ]
})
export class ActivityTasksPageModule {}
