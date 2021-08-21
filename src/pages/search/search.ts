import { Component, ViewChild } from '@angular/core';
import { IonicPage, NavController, NavParams ,Events,ModalController} from 'ionic-angular';
import { MainProvider } from '../../providers/main/main';
import {ProfilePopupPage} from "../profile-popup/profile-popup"

@IonicPage()
@Component({
  selector: 'page-search',
  templateUrl: 'search.html',
})
export class SearchPage {

private users:any;
public profileModal:any = this.modalCtrl.create(ProfilePopupPage, { data: "" },{cssClass: 'profileContent'});
public pan:any=0;

  constructor(public navCtrl: NavController, public navParams: NavParams,public main: MainProvider,public modalCtrl: ModalController,  public events:Events) {
    this.main.getData
  }


  search(ev){
    var x=ev.target.value;
    this.users=[];
    if(x!=''){
      this.main.searchData("/sharedData/usersLists/",x,this.users)
    }
    }

    // =================================================================================================
// form swiching
pressEvent(x,y){
  this.main.getData("/users/"+y.key,null,null,null,null,null).then((v)=>{
  this.profileModal = this.modalCtrl.create(ProfilePopupPage, { data: v },{cssClass: 'profileContent'});
  this.pan=0;
  this.profileModal.present();
})
}
touchend(){
  if(this.pan<5){
  this.profileModal.dismiss();}
  else{  this.events.publish("popup2:true");}}

panEvent(e) {
    this.pan++;
    console.log(this.pan);
  }

}
