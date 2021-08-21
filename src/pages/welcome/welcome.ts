import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { Storage } from '@ionic/storage';
import { SigninPage } from '../signin/signin';
import { MenuController } from 'ionic-angular';


@IonicPage()
@Component({
  selector: 'page-welcome',
  templateUrl: 'welcome.html',
})
export class WelcomePage {
public welcomeImgs:any;
  constructor(public navCtrl: NavController, public navParams: NavParams,public storage:Storage,public menuCtrl:MenuController) {
  }

  ionViewDidLoad() {
    this.welcomeImgs=[{img:"assets/img/welcome1.png"},{img:"assets/img/welcome1.png"},{img:"assets/img/welcome1.png"},{img:"assets/img/welcome1.png"}]
    this.menuCtrl.enable(false);
  }
  finish(){
    this.storage.set("welcome",true);
    this.navCtrl.setRoot(SigninPage);
  }
}
