import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { MainProvider }from '../../providers/main/main';
import { ActivityPage } from '../activity/activity';

var tzoffset=(new Date()).getTimezoneOffset() * 60000;;
@IonicPage()
@Component({
  selector: 'page-notification',
  templateUrl: 'notification.html',
})
export class NotificationPage {
  public notifications:any=[];
  public uid:any;

  constructor(public navCtrl: NavController, public navParams: NavParams,public main:MainProvider) {}

  ionViewDidLoad() {
    this.main.lStorageget('uid').then((value:any) => {this.uid = value;}).then(()=>{
    this.main.getDataFilter1("/users/"+this.uid+"/notification/",null,25,null,null,null).then((task)=>{  //firebase load last 10 notificatins
     for(var i in task){
       this.notifications.unshift(task[i])
       if(task[i].new==true){this.main.setData("/users/"+this.uid+"/notification/"+i+"/new",false)}
     }
   }).then(()=>{
     this.notifications.sort((a, b)=>{
       if (a.timestamp < b.timestamp)return 1;
       if (a.timestamp > b.timestamp)return -1;
       return 0;
     })
   })})
  }

// =============================================================================
// open page

openPage(x,y){
  if(x=="activity"){this.navCtrl.push(ActivityPage,{activity:[y,"joined"]})}
}

}
