import { Component} from '@angular/core';
import { IonicPage, NavController, NavParams ,Events,ModalController} from 'ionic-angular';
import { ActivityPage } from '../activity/activity';
import { MainProvider }from '../../providers/main/main';
import { LocationTracker } from '../../providers/gps/location-tracker';
import { SigninPage } from '../signin/signin';
import { HomePage } from '../home/home';
import { Contacts} from '@ionic-native/contacts';
import { SMS } from '@ionic-native/sms';
import {ProfilePopupPage} from "../profile-popup/profile-popup"
import { ActivitiesTabsPage } from '../activities-tabs/activities-tabs';
var tzoffset=(new Date()).getTimezoneOffset() * 60000;


@IonicPage()
@Component({
  selector: 'page-who',
  templateUrl: 'who.html',
})

export class WhoPage {
public activity:any;
public fifteenList: any=[];
public thirtyList: any=[];
public people:any=[];
public thistab:number=1;
public maxAttend:any="Any";
public minAttend:any="Any";
public uid:string;
public pan:any=0;
public five:any=[];
public fifteen:any=[];
public thirty:any=[];
public fiveFriend:any=[];
public fifteenFriend:any=[];
public contactsList:any=[];
public thirtyFriend:any=[];
public friendlist:any=[];
public fiveFriendF:any=[];
public fifteenFriendF:any=[];
public contactsListF:any=[];
public thirtyFriendF:any=[];
public friendlistF:any=[];
public loaderHide:boolean=true;
public h;
public hm;
public ampm;
public clock;
public fiveF=[];
public fifteenF=[];
public thirtyF=[];
public day;
public auth:boolean;
public uploadedData:any=[];
public keyboardhide:boolean=false;
public profileModal:any = this.modalCtrl.create(ProfilePopupPage, { data: "" },{cssClass: 'profileContent'});

  constructor(public navCtrl: NavController, public navParams: NavParams, public main:MainProvider,public gps:LocationTracker
,  public events:Events,public contacts:Contacts,public sms: SMS,public modalCtrl: ModalController ) {
  window.addEventListener('native.keyboardshow', (e) => {this.keyboardhide=true});
  window.addEventListener('native.keyboardhide', () => {this.keyboardhide=false});
  this.main.lStorageget("autho").then((v)=>{
    if(v==true){
     this.main.getProfile().then((v:any)=>{this.uid=v;})
     this.time1();
     this.auth=false;}
     else{this.auth=true;}
   })

   this.uploadedData=[];
   var opts = {filter : "",multiple: true,hasPhoneNumber:true,fields:  [ 'displayName', 'name' ]};
   this.contacts.find([ 'displayName', 'name',"urls","ims" ],opts).then((contacts) => {this.contactsList=contacts; },
     (error) => {console.log(error); this.loaderHide=true;}).then(()=>{
   for(let i in this.contactsList){
     if(this.contactsList[i]._objectInstance.name!=null){
     if(this.contactsList[i]._objectInstance.phoneNumbers!=null){
     for(let j =0 ;j<this.contactsList[i]._objectInstance.phoneNumbers.length;j++){
     this.contactsList[i]._objectInstance.phoneNumbers[j].value = this.contactsList[i]._objectInstance.phoneNumbers[j].value.replace(/[^\d]/g, '');
     this.uploadedData.push(this.contactsList[i]._objectInstance.phoneNumbers[j].value)}}
     if(this.contactsList[i]._objectInstance.emails!=null){
     for(let j =0 ;j<this.contactsList[i]._objectInstance.emails.length;j++){
     this.uploadedData.push(this.contactsList[i]._objectInstance.emails[j].value)}}
     if(this.contactsList[i]._objectInstance.name.formatted!=(undefined || null)){
     var char =this.contactsList[i]._objectInstance.name.formatted.charAt(0);
     this.contactsList[i]._objectInstance.char=char;}
     else{ this.contactsList.splice(i,1) }}
     else{this.contactsList.splice(i,1)}
 }
 }).then(()=>{
   this.contactsList.sort((a, b)=>{
    if (a._objectInstance.name.formatted > b._objectInstance.name.formatted)return 1;
    if (a._objectInstance.name.formatted < b._objectInstance.name.formatted)return -1;
    return 0;
  })
   this.main.lStorageget("uid").then((v:any)=>{
   this.uid=v;
   var m=this.friendlist;
   m=m.concat(this.fiveFriend);
   m=m.concat(this.fifteenFriend);
   m=m.concat(this.thirtyFriend);
   for(let i=0;i<m.length;i++){
     for(let j in this.contactsList){
       this.contactsList.check=false;
       if(this.contactsList[j]._objectInstance.phoneNumbers!=null){
       for(let k =0 ;k<this.contactsList[j]._objectInstance.phoneNumbers.length;k++){
         if(this.contactsList[j]._objectInstance.phoneNumbers[k].value.replace(/[^\d]/g, '') == m[i].phone){this.contactsList.splice(j,1)}
       }}
       if(this.contactsList[j]._objectInstance.emails!=null){
       for(let k =0 ;k<this.contactsList[j]._objectInstance.emails.length;k++){
         if(this.contactsList[j]._objectInstance.emails[k].value.replace(/[^\d]/g, '') == m[i].email){this.contactsList.splice(j,1)}
       }}
      }
   }
     this.contactsListF=this.contactsList;
   if(this.auth==false){this.main.setData("/users/"+this.uid+"/friends/",this.uploadedData)}});
})
  }

  ionViewDidLoad() {
    this.events.subscribe('popup2:false', () => {this.profileModal.dismiss();})
    this.activity=this.navParams.get('who');
    this.main.lStorageget("uid").then((value:any)=>{
      this.uid=value;
    if(this.auth==false){this.main.getFriendsON('/users/'+this.uid+"/sfriends/",this.friendlist,this.friendlistF).then(()=>{
    setTimeout(()=>{
      this.gps.getNear(20,this.five,this.fifteen,this.thirty,this.fiveF,this.fifteenF,this.thirtyF,this.fiveFriend,this.fifteenFriend,this.thirtyFriend,this.fiveFriendF,this.fifteenFriendF,this.thirtyFriendF,"gps","",this.activity.interest.name,this.friendlist,this.friendlistF);
    },1500);
  })}
  else if(this.auth==true){
    setTimeout(()=>{
      this.gps.getNear(20,this.five,this.fifteen,this.thirty,this.fiveF,this.fifteenF,this.thirtyF,this.fiveFriend,this.fifteenFriend,this.thirtyFriend,this.fiveFriendF,this.fifteenFriendF,this.thirtyFriendF,"gps","",this.activity.interest.name,this.friendlist,this.friendlistF)
    },1500);
  }
  })
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
  }

  changeForm(x){
    if(x==1){this.thistab=2;}
    else{this.thistab=1;}
  }


  // =================================================================================================
  // search

    search(x:any){
      var val=x.target.value;
      return new Promise((resolve,reject)=>{
      this.fiveFriendF = this.fiveFriend.filter((v) => {
          if (v.profile[0].name.toLowerCase().indexOf(val.toLowerCase()) > -1) {  return true;}
      })
       resolve("done")}).then((v)=>{
      this.fifteenFriendF = this.fifteenFriend.filter((v) => {
          if (v.profile[0].name.toLowerCase().indexOf(val.toLowerCase()) > -1) {  return true;}})
        return("done")}).then((v)=>{
      this.thirtyFriendF = this.thirtyFriend.filter((v) => {
          if (v.profile[0].name.toLowerCase().indexOf(val.toLowerCase()) > -1) {  return true;}})
        return("done")}).then((v)=>{
      this.friendlistF = this.friendlist.filter((v) => {
          if (v.name.toLowerCase().indexOf(val.toLowerCase()) > -1) {  return true;}})
        return("done")}).then((v)=>{
      this.contactsListF = this.contactsList.filter((v) => {
          if (v._objectInstance.name.formatted.toLowerCase().indexOf(val.toLowerCase()) > -1) {  return true;}
      })}).then((v)=>{
        this.fiveF = this.five.filter((v) => {
          if (v.profile[0].name.toLowerCase().indexOf(val.toLowerCase()) > -1) {  return true;}
      })}).then((v)=>{
        this.fifteenF = this.fifteen.filter((v) => {
          if (v.profile[0].name.toLowerCase().indexOf(val.toLowerCase()) > -1) {  return true;}
      })}).then((v)=>{
        this.thirtyF = this.thirty.filter((v) => {
          if (v.profile[0].name.toLowerCase().indexOf(val.toLowerCase()) > -1) {  return true;}
      })})
    }

    // =================================================================================================
    // min max numbers

attendNumber(x){
   if(x=="minIncrease"){
     if(this.minAttend=="Any"){this.minAttend=1;}
     else{
       if(this.maxAttend>this.minAttend || this.maxAttend=="Any"){this.minAttend++;}
   }
   }
   if(x=="maxIncrease"){
     if(this.maxAttend=="Any"){
        if(this.minAttend!="Any"){this.maxAttend=this.minAttend}
        else{this.maxAttend=1;}}
     else{this.maxAttend++;}
   }
   if(x=="minDecrease"){
     if(this.minAttend=="1"){this.minAttend="Any";}
     else{this.minAttend--;}
   }
   if(x=="maxDecrease"){
     if(this.maxAttend=="1"){this.maxAttend="Any";}
     else{
       if(this.minAttend<this.maxAttend){this.maxAttend--;}
       else{this.maxAttend="Any"}}
   }
   }


// ===================================================================================================
// complete event and open the activity page

openPage(){
  var count=0;
  this.loaderHide=false;
  new Promise((resolve,reject)=>{
    this.people=[];
      var total=this.fiveFriend;
      total=total.concat(this.fifteenFriend);
      total=total.concat(this.thirtyFriend);
      total=total.concat(this.five);
      total=total.concat(this.fifteen);
      total=total.concat(this.thirty);
      total=total.concat(this.friendlist)
  for (var i = 0; i < total.length; i++){
   if(total[i].check==true){
     if(total[i].interests==undefined){total[i].profile=[{profile:total[i].profile,name:total[i].name}]}
     count++;
     for(var j in total[i]){  if((j!="profile") && (j!="key")){delete total[i][j]}}
     total[i].profile[0]={name:total[i].profile[0].name,profile:total[i].profile[0].profile}
     this.people[total[i].key]=total[i];
   }}
   console.log(this.people)
  resolve("done");
   }).then((v)=>{
  if(count==0){
    this.loaderHide=true;
  this.main.viewMassageTwoValues("Are you sure you want to continue without inviting any one.","").then((v)=>{
    if(v=="yes"){this.complete();}
    if(v=="no"){}
  })}
  else if(count!=0){this.complete();}
 })
}

complete(){
  this.activity.attendLimits={max:this.maxAttend,min:this.minAttend};
  this.activity.invited=this.people;
  if(this.auth==false){
  this.main.getData("/users/"+this.uid,null,null,null,null,null).then((v:any)=>{
    v.key=this.uid;
    for(var j in v){if((j!="profile") && (j!="key")){delete v[j]}}
    v.profile[0]={name:v.profile[0].name,profile:v.profile[0].profile}
   this.activity.joined=[];
   this.activity.joined[this.uid]=v;
   this.activity.admins=[];
   this.activity.admins[this.uid]=v;
   this.activity.creator=v;
 }).then(()=>{
   var phoneList=[];
  this.main.pushData("mainData/Activities/",this.activity).then((v:string)=>{
    this.activity.invited[this.uid] = this.activity.joined[this.uid];
    for(var c=0; c<this.contactsList.length;c++){
      if(this.contactsList[c].check==true ){
        this.sms.send(this.contactsList[c]._objectInstance.phoneNumbers[0].value.toString(),this.contactsList[c]._objectInstance.name.formatted+"come for "+this.activity.interest.name+" with me and a bunch of others by downloading Lets meet.\n Play Store :  \nApp Store :",{replaceLineBreaks:true,android:{intent:""}});
      }
    }
    var x={id:v,state:"joined",creator:{}, name:this.activity.interest.name,time:this.activity.time,place:this.activity.place.name,color:this.activity.interest.color,join:"true",people:this.activity.invited,admins:{}};
    var y={id:v,state:"invited",name:this.activity.interest.name,time:this.activity.time,place:this.activity.place.name,color:this.activity.interest.color,join:"true",people:this.activity.invited,admins:{},creator:{}};
    var notifi={new:true,day:this.day, timestamp:Math.floor(Date.now() / 1000), id: v, time:this.clock,message:"you hava invited to a new "+this.activity.interest.name+" activity, created by "+this.activity.joined[this.uid].profile[0].name +"."}
    this.main.getData("/users/"+this.uid,null,null,null,null,null).then((m:any)=>{
      m.key=this.uid;
      m={profile:m.profile, key:m.key};
      m.profile[0]={name:m.profile[0].name,profile:m.profile[0].profile}
      x.admins[this.uid]=m;
      x.creator=m;
      y.admins[this.uid]=m;
      y.creator=m;
    for(var i in this.people){
      if(i!=this.uid){
        this.main.setData("/users/"+this.people[i].key+"/activity/"+v,y);
        this.main.setData("/users/"+this.people[i].key+"/notification/"+v,notifi)
      }
    }
    this.main.setData("/users/"+this.uid+"/activity/"+v,x);

    this.main.setData("/users/"+this.uid+"/interests/"+this.activity.interest.name,this.activity.interest)
    this.main.increase("/users/"+this.uid+"/profile/0/joinNo");
    this.loaderHide=true;
    this.navCtrl.setRoot(HomePage);
    this.navCtrl.push(ActivitiesTabsPage);
    this.navCtrl.push(ActivityPage,{activity:[v,"joined"],first:true});
  })})})
} else{this.navCtrl.push(SigninPage,{activity:[this.activity]});}
}

publicActivity(){
  this.activity.attendLimits={max:this.maxAttend,min:this.minAttend};
  this.loaderHide=false;
  this.main.getData("/users/"+this.uid,null,null,null,null,null).then((v:any)=>{
    v.key=this.uid;
    for(var j in v){if((j!="profile") && (j!="key")){delete v[j]}}
    v.profile[0]={name:v.profile[0].name,profile:v.profile[0].profile}
   this.activity.joined=[];
   this.activity.joined[this.uid]=v;
   this.activity.admins=[];
   this.activity.creator=v;
   this.activity.admins[this.uid]=v;
   this.activity.type='public';
   this.main.setData("/users/"+this.uid+"/interests/"+this.activity.interest.name,this.activity.interest)

 }).then(()=>{
  // this.main.pushData('mainData/publicActivities/',this.activity).then((v)=>{
    this.main.pushData('mainData/Activities/',this.activity).then((v)=>{
     this.main.setData('mainData/publicActivities/'+v,this.activity);
      this.loaderHide=true;
  this.navCtrl.setRoot(HomePage);
  this.navCtrl.push(ActivitiesTabsPage);
  this.navCtrl.push(ActivityPage,{activity:[v,"joined"],public:true})
})
  });
// })
}
  // ============================================================================================
// time function
  time1(){
   this.h = new Date().getHours();
   this.hm = new Date().getMinutes();
   var ampm = this.h >= 12 ? ' PM' : 'AM';
   this.h = this.h % 12;
   if (this.h===0) {this.h=12;}
   if(this.hm>10){
   this.clock = this.h + ':' + this.hm  + ampm;}
   if(this.hm<=10){
   this.clock = this.h + ':' +"0" + this.hm  + ampm;}
   this.day=((new Date(Date.now() - tzoffset)).toISOString()).slice(0,10);
  }

    }
