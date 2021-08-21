import { Component, ViewChild  } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { SigninPage } from '../signin/signin';
import { MainProvider }from '../../providers/main/main';

@IonicPage()
@Component({
  selector: 'page-forget',
  templateUrl: 'forget.html',
})
export class ForgetPage {
  public loaderHide:boolean=true;
  public input:any=[];

  @ViewChild('b1') b1;
  constructor(public navCtrl: NavController, public navParams: NavParams , public main:MainProvider) {
    setTimeout(() => {this.b1.setFocus();},300);
  }

  ionViewDidLoad() {
  }

  // ==========================================================================================================
  // input functions

  end(a,b){
    if(a==13){this.forget(b);}
  }

  // ======================================================================================================================
  // forms changing   input:current form
  changeForm(){
      this.navCtrl.popToRoot();
  }

  // ===============================================================================================================================
  // forget password            input:email

  forget(x){
  this.main.resetPassword(x).then((data)=>{
  if(data!=undefined){
  this.main.viewMassageOneValue(data,"Error");}                                                    //show error message
  else{
  this.main.viewMassageOneValue("Check your mail box and follow reseting password rules.","Done");  //show check inbox message
  }});
  }
}
