import { PublicActivitiesPage } from './../public-activities/public-activities';
import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, Events } from 'ionic-angular';
import { ActivitiesPage } from '../activities/activities';
import { ActivityPage } from '../activity/activity';


@IonicPage()
@Component({
  selector: 'page-activities-tabs',
  templateUrl: 'activities-tabs.html',
})
export class ActivitiesTabsPage {
  tab1Root = ActivitiesPage;
  tab2Root = PublicActivitiesPage;
  constructor(public navCtrl: NavController, public navParams: NavParams,public event:Events) {
    this.event.unsubscribe('navigate:activity');
    this.event.subscribe('navigate:activity',(v)=>{
        this.navCtrl.push(ActivityPage,v);
    })
  }


  ionViewDidLoad() {
    console.log('ionViewDidLoad ActivitiesTabsPage');
  }

}
