import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { ActivitiesTabsPage } from './activities-tabs';

@NgModule({
  declarations: [
    ActivitiesTabsPage,
  ],
  imports: [
    IonicPageModule.forChild(ActivitiesTabsPage),
  ],
})
export class ActivitiesTabsPageModule {}
