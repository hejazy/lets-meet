import { Component,ViewChild } from '@angular/core';
import { IonicPage, NavController, NavParams ,Events,ActionSheetController} from 'ionic-angular';
import { MainProvider }from '../../providers/main/main';
import {Md5} from 'ts-md5/dist/md5';
import { Storage } from '@ionic/storage';
import { MenuController } from 'ionic-angular';
import { SigninPage } from '../signin/signin';
import { LocationTracker } from '../../providers/gps/location-tracker';
import { InterestPage } from '../interest/interest';
import { FirebaseProvider } from "angular-firebase";

@IonicPage()
@Component({
  selector: 'page-profile',
  templateUrl: 'profile.html',
})
export class ProfilePage {
  public user:any=[];
  public default:string;
  public disableEdit:boolean=true;
  public disableEditEmail:boolean=true;
  public location:boolean=false;
  public notification:boolean=false;
  public uid:string="";
  public passw:string="";
  public authType:any="";
  public captureDataUrl:any;
  public loaderHide:boolean=true;
  public genderr:any;
  public available:any;

@ViewChild ("a1")  a1;
@ViewChild ("a2")  a2;
@ViewChild ("a3")  a3;
@ViewChild ("a4")  a4;
@ViewChild ("a5")  a5;
@ViewChild ("a6")  a6;
@ViewChild ("a7")  a7;
@ViewChild ("a8")  a8;
@ViewChild ("a9")  a9;


  constructor(public navCtrl: NavController, public navParams: NavParams,public main:MainProvider,public menuCtrl:MenuController, public events: Events
  ,public actionSheetCtrl: ActionSheetController,public gps:LocationTracker,public fb:FirebaseProvider) {
    this.events.subscribe("noInternet:change", (userData) => {
      if(userData==true){this.loaderHide=true;}
    })
        this.main.lStorageget("user").then((v)=>{this.user=v; console.log(this.user)}).then(()=>{
          this.genderr=this.user[0].gender;
          this.captureDataUrl=this.user[0].profile;
          this.passw="xxxxxxxx";
          if(this.user[0].birth!=undefined){this.default=this.user[0].birth;}
          else{this.default=""}
          if(this.user[0].phone==undefined){this.user[0].phone=""}
          if(this.user[0].course==undefined){this.user[0].course=""}
        }).then(()=>{this.main.lStorageget("authType").then((v)=>{
          if(v!=undefined){this.authType=v;}
        })})
  }

  ionViewDidLoad() {
    this.main.lStorageget("uid").then((v:any)=>{
      this.uid=v;
      if(this.user[0].available!=undefined){this.available=this.user[0].available;}
      if(this.user[0].location!=undefined){this.location=this.user[0].location;}
      if(this.user[0].notification!=undefined){this.notification= this.user[0].notification;}});
  }

enableEdit(val1,val2){
  if(this.disableEdit==true){this.disableEdit=false; if(this.authType!="facebook"){this.disableEditEmail=false}}
  else{
    this.loaderHide=false;
    if(this.a1.value!=this.user[0].email || this.passw!="xxxxxxxx" ||this.a3.value!=this.user[0].phone || this.default!=this.user[0].birth ||this.a4.value!=(this.user[0].university)||this.a5.value!=(this.user[0].course) || (this.a7.value!=this.user[0].name) || (this.genderr!=this.user[0].gender)){
      if(this.passw.length>7){
        this.main.viewMassageTwo(val1,val2 ,this.user[0].pass ).then((v)=>{
        if(v[0]=="yes"){
          var pass=this.user[0].pass;
          if(this.a1.value!=this.user[0].email){this.main.signinMail(this.user[0].email,v[1]).then(()=>{this.main.updateEmail(this.a1.value);})};
          if(this.passw!="xxxxxxxx"){ pass=Md5.hashStr(this.a2.value); this.main.signinMail(this.user[0].email,v[1]).then(()=>{ this.main.updatePassword(this.a2.value);})};
          this.user=[{ gender:this.genderr,name: this.a7.value, pass:pass,  birth:this.default,email: this.a1.value,phone:this.a3.value,profile:this.user[0].profile,verify:this.user[0].verify,available:this.available,university:this.a4.value, course:this.a5.value, notification:this.notification,location:this.location}];
          this.main.lStorageset("user",this.user).then(()=>{
          if(this.default!=this.user[0].birth || (this.genderr!=this.user[0].gender)) { this.main.onesignalSetTags(this.default,this.genderr)}
          this.events.publish('username:changed', this.user);
          this.main.setData("/users/"+this.uid+"/profile/",this.user)
          console.log(this.a1.value,this.a3.value)
          this.main.setData("/sharedData/usersLists/"+this.uid,{email:this.a1.value ,phone:this.a3.value.replace(/[^\d]/g, ''),name:this.a7.value,profile:this.user[0].profile});
            this.disableEdit=true;
            this.disableEditEmail=true;
            this.loaderHide=true;
            if(this.captureDataUrl!=this.user[0].profile){
              this.loaderHide=false;
              if (!this.captureDataUrl) {
                var x =document.getElementById('image');
                this.captureDataUrl = this.getBase64Image(x);
              }
              this.fb.uploadString(this.captureDataUrl, "images/users/" + this.uid + "Profile.jpg", 'base64').then((url: string) => {
              this.user[0].profile=url}).then(()=>{
                this.main.lStorageset("user",this.user);
                this.events.publish('username:changed', this.user);
                this.main.setData("/users/"+this.uid+"/profile/",this.user)
                this.disableEdit=true;
                this.disableEditEmail=true;
                this.loaderHide=true;
              })
            }
          })
        }
        else if(v[0]=="error"){this.enableEdit("Please re-enter your password again.","Incorrect Password"); return; }
        else{this.loaderHide=true;}
      })
    }
    else{this.main.viewMassageOneValue("Password is less than 8 characters ,please try again","")}
  }
    else if(this.captureDataUrl!=this.user[0].profile){
      if (!this.captureDataUrl) {
        var x =document.getElementById('image');
        this.captureDataUrl = this.getBase64Image(x);
      }
      this.fb.uploadString(this.captureDataUrl, "images/users/" + this.uid + "Profile.jpg", 'base64').then((url: string) => {this.user[0].profile=url}).then(()=>{
          this.main.lStorageset("user",this.user);
          this.events.publish('username:changed', this.user);
          this.main.setData("/users/"+this.uid+"/profile/0/profile",this.user[0].profile)
          this.disableEdit=true;
          this.disableEditEmail=true;
          this.loaderHide=true;
        })
    }
    else{this.disableEdit=true; this.disableEditEmail=true; this.loaderHide=true;}
  }
}
cancelEdit(){
  this.disableEdit=true; this.disableEditEmail=true; this.captureDataUrl=this.user[0].profile;
}

Toggle(x){
  if(x=="notification"){this.main.lStorageset("user",this.user); this.main.setData("/users/"+this.uid+"/profile/0/notification",this.notification);}
  if(x=="available"){this.main.lStorageset("user",this.user); this.main.setData("/users/"+this.uid+"/profile/0/available",this.available);}
  else if(x=="location"){
    this.main.lStorageset("user",this.user).then(()=>{
    this.main.setData("/users/"+this.uid+"/profile/0/location",this.location);
    if(this.location==true){this.gps.start("");}
    if(this.location==false){this.main.deleteData("/mainData/location/"+this.uid); this.gps.clearWatchLocation();}
  })}
    this.user[0].notification=this.notification; this.user[0].location=this.location;this.user[0].available=this.available
}

uploadImage(){
let alert =  this.actionSheetCtrl.create({
     title: 'Pick image from',
     buttons: [
       {text: 'Camera',   handler: () => {this.main.cameraCap().then((v:any)=>{this.captureDataUrl=v})} },
       { text: 'Gallery', handler: () => {this.main.gallery().then((v:any)=>{this.captureDataUrl=v})} }
      ]
     });
    alert.present();
}
  logout(){
    this.main.lStorageset("autho",false);
    this.navCtrl.setRoot(SigninPage);
    this.main.signout();
    this.menuCtrl.close();
   }
   showInterests(){
     this.navCtrl.push(InterestPage)
   }
   getBase64Image(img) {
    var canvas = document.createElement("canvas");
    canvas.width = img.width;
    canvas.height = img.height;
    var ctx = canvas.getContext("2d");
    ctx.drawImage(img, 0, 0);
    var dataURL = canvas.toDataURL("image/png");
    return dataURL.replace(/^data:image\/(png|jpg);base64,/, "");
  }
}
