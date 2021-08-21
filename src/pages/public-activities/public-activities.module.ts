import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { PublicActivitiesPage } from './public-activities';

@NgModule({
  declarations: [
    PublicActivitiesPage,
  ],
  imports: [
    IonicPageModule.forChild(PublicActivitiesPage),
  ],
})
export class PublicActivitiesPageModule {}
