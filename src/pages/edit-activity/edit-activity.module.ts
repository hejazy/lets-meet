import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { EditActivityPage } from './edit-activity';

@NgModule({
  declarations: [
    EditActivityPage,
  ],
  imports: [
    IonicPageModule.forChild(EditActivityPage),
  ],
  exports: [
    EditActivityPage
  ]
})
export class EditActivityPageModule {}
