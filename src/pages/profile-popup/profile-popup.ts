import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ViewController } from 'ionic-angular';
import { Renderer } from '@angular/core';
import { MainProvider }from '../../providers/main/main';

@IonicPage()
@Component({
  selector: 'page-profile-popup',
  templateUrl: 'profile-popup.html',
})
export class ProfilePopupPage {
public person:any;
public admin:any;
public id:string;
public activityId:string;
public activity:any;
public done:boolean=false;
public interests=[];
  constructor(public navCtrl: NavController, public navParams: NavParams,  public renderer: Renderer,  public viewCtrl: ViewController ,public main:MainProvider ) {
    this.renderer.setElementClass(viewCtrl.pageRef().nativeElement, 'my-popup', true);
          this.activityId= this.navParams.get("activity");
          this.person=this.navParams.get('data');
          for(let i in this.person.interests){
          this.interests.push(this.person.interests[i])
          }
    this.main.getData("/mainData/Activities/"+this.activityId+"/admins/",null,null,null,null,null).then((v)=>{
      if(v!=undefined){this.activity=v;}
      this.id = this.navParams.get('id');
      this.admin= this.navParams.get("admin");
      this.done=false;
    })
  }

  ionViewDidLoad() {
  }

  addAsAdmin(){
    this.main.setData("/mainData/Activities/"+this.activityId+"/admins/"+this.id+"/",{key:this.id,profile:this.person.profile}).then(()=>{
      this.done=true;
      console.log(this.done);
    })
  }


}
