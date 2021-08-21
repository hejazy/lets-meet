import { Component, ViewChild  } from '@angular/core';
import { IonicPage, NavController, NavParams,Events,MenuController } from 'ionic-angular';
// import { Facebook, FacebookLoginResponse } from '@ionic-native/facebook';
import { MainProvider }from '../../providers/main/main';
import { HomePage } from '../home/home';
import { InterestPage } from '../interest/interest';
import { SignupPage } from '../signup/signup';
import { ForgetPage } from '../forget/forget';
// import { SignupfPage } from '../signupf/signupf';
import { ActivityPage } from '../activity/activity';
import { ActivitiesPage } from '../activities/activities';
import * as firebase from 'firebase';
var tzoffset=(new Date()).getTimezoneOffset() * 60000;


@IonicPage()
@Component({
  selector: 'page-signin',
  templateUrl: 'signin.html',
})
export class SigninPage {
public uid:string;
public autho:boolean=false;
public loaderHide:boolean=true;
public input:any=[];
public user:any=[];
public mailKey:string;
public activity:any="";
public invited:string="";
public clock;
public day;

@ViewChild('t1') t1;
@ViewChild('t2') t2;

  constructor(public navCtrl: NavController, public navParams: NavParams,
    // public fb:Facebook,
     public main:MainProvider,
     public events: Events,public menuCtrl:MenuController) {
  this.activity=this.navParams.get('activity');
  this.invited=this.navParams.get('invited');
  this.menuCtrl.enable(false);
    setTimeout(() => {this.t1.setFocus();},300);  //focus the signin input when load app
  }

  ionViewDidLoad() {
    if(this.activity==undefined){this.activity=""}
    else{this.main.viewMassageOneValue("To complete making activity, you should sign in first.","")}
    if(this.invited==undefined){this.invited=""}
    else{console.log(this.invited);this.main.viewMassageOneValue("You are invited to an activity, Please sign in first.","")}
  }
// ==========================================================================================================
// input functions

  next(x,y){               //go to next input when press enter  inputs:key no & the input id
this.input={t1:this.t1,t2:this.t2};
if(x==13){
  var z = y.charAt(1);
  var c = y.charAt(0);
  z = parseInt(z)+1;
  y=c+z;
  this.input[y].setFocus();
}}

end(a,b,c){
  if(a==13){this.signin(b,c);}
}

// ======================================================================================================================
// forms changing   input:current form
changeForm(x){
  if(x=="signup"){   //open signup form
this.main.lStorageget("invited").then((data:string)=>{
    if(this.activity=="" && data==undefined){this.navCtrl.push(SignupPage);}
    else if(this.activity==""){this.navCtrl.push(SignupPage,{invited:this.activity});}
    else{this.navCtrl.push(SignupPage,{activity:this.activity});}})}
  if(x=="forget"){    //open forget form
    this.navCtrl.push(ForgetPage)
}
}

// ================================================================================================================
// signin function        input: email & password

signin(a,b){
this.main.lStorageget("invited").then((data:string)=>{
  if(data!=undefined){this.invited=data;}
this.loaderHide=false;
this.main.signinMail(a,b).then((value)=>{
  if (value=="[object Object]"){
   this.main.lStorageset("autho",true).then((v)=>{
    var newtext =a.replace("@","");
    this.mailKey =newtext.replace(".","");
    this.main.lStorageset("mailkey",this.mailKey)
    this.main.getProfile().then((v:string)=>{this.uid=v; this.main.lStorageset("uid",this.uid);}).then((v)=>{
      this.main.onesignalInit().then((v)=>{
        this.main.setData("/users/"+this.uid+"/notificationid",v);
      })
    this.main.getData("users/"+this.uid+"/profile/","","","","","").then((snapshot) => {
    this.user=snapshot;
    this.events.publish('username:changed', this.user);
    this.events.publish('uid:changed', this.uid);
    this.main.lStorageset("user",this.user).then(()=>{
    this.main.lStorageset("authType","email");
    this.loaderHide=true;
    console.log(this.invited)
    if(this.activity=="" && this.invited==""){
      this.main.checkExist("/users/"+this.uid+"interests").then((v)=>{
          if(v!=(undefined || null)){this.navCtrl.setRoot(HomePage); this.main.lStorageset("interestsdone",true);}
          else{this.navCtrl.setRoot(InterestPage); this.main.lStorageset("interestsdone",false);}
      })}
    else if(this.invited==""){this.complete();}
    else if(this.invited!=""){
      console.log(this.invited);
      this.main.setData("mainData/Activities/"+this.invited+"/invited/"+this.uid,{key:this.uid,profile:[{name:this.user[0].name,profile:this.user[0].profile}]})
      this.navCtrl.setRoot(HomePage);
      this.navCtrl.push(ActivitiesPage);
      this.navCtrl.push(ActivityPage,{activity:[this.invited,"invited"]});
    }
})})})})}
  else{
    if(value=="The email address is badly formatted."){value="Check your email address."}
   this.main.viewMassageOneValue(value,"Error");
   this.loaderHide=true;}
})})
}
// ===========================================================================================================================
// facebook Login

  // facebookLogin(){
  //   this.main.lStorageget("invited").then((data:string)=>{
  //     if(data!=undefined){this.invited=data;}
  //   this.loaderHide=false;
  //   this.fb.login(['email','public_profile', 'user_friends']).then( (response) => {                     //facebook plugin signin
  //   const facebookCredential = firebase.auth.FacebookAuthProvider.credential(response.authResponse.accessToken);
  //   this.main.signin3rdparty(facebookCredential).then((success:any) => {                        //firebase signin with facebook
  //     var newtext =success.email.replace("@","");
  //     this.mailKey =newtext.replace(".","")
  //     this.main.getProfile().then((v:string)=>{this.uid=v; this.main.lStorageset("uid",this.uid);}).then((v)=>{
  //    this.main.getData("users/"+this.uid+"/profile/","","","","","").then((snapshot) => {
  //      if(snapshot==undefined || snapshot==null ){
  //        console.log(snapshot)
  //        this.loaderHide=true;
  //        this.navCtrl.push(SignupfPage,{invited:this.invited,activity:this.activity,signup:{name: success.displayName,email:success.email,profile:success.photoURL,verify:success.emailVerified}});
  //     }
  //    else{
  //      console.log(snapshot);
  //      this.user=snapshot;
  //      this.main.lStorageset('user',snapshot).then((data1) =>{                                                                                           //if not first time to sign in using facebook
  //       this.main.lStorageset("autho",true);
  //       this.main.setData("/users/"+this.uid+"/profile/0/available",true)}).then(()=>{
  //         this.main.lStorageset("authType","facebook");
  //         this.events.publish('username:changed', this.user);
  //         this.main.onesignalInit().then((v)=>{
  //           this.main.setData("/users/"+this.uid+"/notificationid",v);
  //         })
  //         this.loaderHide=true;
  //         if(this.activity==""&& this.invited==""){this.navCtrl.setRoot(HomePage);}
  //         else if(this.invited==""){this.complete();}
  //         else if(this.invited!=""){
  //           this.main.setData("mainData/Activities/"+this.invited+"/invited/"+this.uid,{key:this.uid,profile:[{name:this.user[0].name,profile:this.user[0].profile}]})
  //           this.navCtrl.setRoot(HomePage);
  //           this.navCtrl.push(ActivitiesPage);
  //           this.navCtrl.push(ActivityPage,{activity:[this.invited,"invited"]});
  //         }
  //       })};
  //     })})}).catch((error) => {this.loaderHide=true;console.log(error)});}).catch((error) => {this.loaderHide=true;console.log(error)});
  //   })
  // }


tryIt(){
  this.navCtrl.push(HomePage);
}


complete(){
  this.activity=this.activity[0];
  this.main.getData("/users/"+this.uid,null,null,null,null,null).then((v:any)=>{
    for(var j in v){if((j!="profile") && (j!="key")){delete v[j]}}
    v.profile[0]={name:v.profile[0].name,profile:v.profile[0].profile}
   this.activity.joined=[];
   this.activity.joined[this.uid]=v;
   return this.uid;
 }).then((data)=>{
  this.main.pushData("mainData/Activities/",this.activity).then((v:string)=>{
    this.activity.invited[data] = this.activity.joined[data];
    var x={id:v,state:"joined",creator:true, name:this.activity.interest.name,time:this.activity.time,place:this.activity.place.name,color:this.activity.interest.color,join:"true",people:this.activity.invited};
    var y={id:v,state:"invited",name:this.activity.interest.name,time:this.activity.time,place:this.activity.place.name,color:this.activity.interest.color,join:"true",people:this.activity.invited};
    var notifi={new:true,day:this.day, timestamp:Math.floor(Date.now() / 1000), id: v, time:this.clock,message:"you hava invited to a new "+this.activity.interest.name+" activity, created by "+this.activity.joined[data].profile[0].name +"."}
    this.main.setData("/users/"+this.uid+"/activity/"+v,x);
    for(var i=0; i>this.activity.invited;i++){
      if(this.activity.invited[i].key!=data){
        this.main.setData("/users/"+this.activity.invited[i].key+"/activity/"+v,y);
        this.main.setData("/users/"+this.activity.invited[i].key+"/notification/"+v,notifi)
      };
    }
    this.main.increase("/users/"+this.uid+"/profile/0/joinNo");
    this.loaderHide=true;
    this.menuCtrl.enable(true);
    this.navCtrl.setRoot(HomePage);
    this.navCtrl.push(ActivitiesPage);
    this.navCtrl.push(ActivityPage,{activity:[v,"joined"],first:true});
  })})
}

time1(){
  var h; var hm;
 h = new Date().getHours();
 hm = new Date().getMinutes();
 var ampm = h >= 12 ? ' PM' : 'AM';
 h = h % 12;
 if (h===0) {h=12;}
 if(hm>10){
 this.clock = h + ':' + hm  + ampm;}
 if(hm<=10){
 this.clock = h + ':' +"0" + hm  + ampm;}
 this.day=((new Date(Date.now() - tzoffset)).toISOString()).slice(0,10);
}

// tested funcitonality
  // googleLogin(){
  //   this.googlePlus.login({'webClientId': '14925938746-j0h8fohdt6s0b0rldd0r386o6ccqeek3.apps.googleusercontent.com','offline': true}).then((res) => {  //google plugin
  //     const googleCredential = firebase.auth.GoogleAuthProvider.credential(res.idToken);
  //     this.mainProvid.signin3rdparty(googleCredential).then( (success:any) => {                                   //firebase signin with google
  //       this.mainProvid.getData("users/"+success.uid+"/user",null,null,null,null,null).then((snapshot) => {
  //           this.user=[{name: success.displayName,mail:success.email,pass: "googleAccount",profile:success.photoURL,verify:success.emailVerified,available:true}]
  //         if(snapshot==undefined || snapshot==null){                                                                             //if the first time make new user folder
  //           this.mainProvid.getProfile().then((v:string)=>{this.uid=v;}).then((v)=>{;
  //           this.storage.set('user',this.user)}).then((data1) =>{
  //           this.mainProvid.setData("/users/"+this.uid+"/user",this.user);
  //           this.storage.set("autho",true).then((v)=>{
  //           this.storage.set("authType","google")
  //           var newtext =success.email.replace("@","");
  //            this.mailKey =newtext.replace(".","");
  //         }).then((v)=>{this.storage.set("mailkey",this.mailKey);
  //         })}).then((v)=>{this.navCtrl.setRoot(HomePage);})}
  //        else{                                                                                                                     //if not first time to sign in using facebook
  //          this.mainProvid.getProfile().then((v:string)=>{this.uid=v;}).then((v)=>{
  //          this.mainProvid.setData("/users/"+this.uid+"/user",this.user);
  //          this.storage.set("autho",true);
  //           this.navCtrl.setRoot(HomePage);}).then(()=>{
  //             this.storage.set("authType","google");
  //           })};})
  //       })})
  //     .catch(err => console.error("err"));
  // }

}
