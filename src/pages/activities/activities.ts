import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams,Events,MenuController } from 'ionic-angular';
import { MainProvider }from '../../providers/main/main';
import { FirebaseProvider } from "angular-firebase";

var tzoffset=(new Date()).getTimezoneOffset() * 60000;;

@IonicPage()
@Component({
  selector: 'page-activities',
  templateUrl: 'activities.html',
})
export class ActivitiesPage {
  public activities:any=[];
  public uid:any;
  public activitiesIndex:any=[];
  public x:any=[[]];
  public loaderHide:boolean=false;
  public today:any=parseInt(((new Date(Date.now() - tzoffset)).toISOString()).slice(0,16).replace(/\D/g,''));


  constructor(public navCtrl: NavController, public navParams: NavParams,public main:MainProvider ,public event:Events,public menuCtrl:MenuController, public fb:FirebaseProvider) {
  this.menuCtrl.enable(true);}


  ionViewDidLoad() {
    this.loaderHide=false;
    this.event.subscribe("noInternet:change", (userData) => {
      if(userData==true){this.loaderHide=true;}
    })
    this.event.subscribe("unjoin:done", (v)=>{
      this.loadData();
    })
    this.main.getProfile().then((v)=>{this.uid=v;}).then(()=>{this.loadData()})
}



loadData(){
  this.menuCtrl.enable(true);
  this.activities=[];
  this.activitiesIndex=[];
  this.x=[[]];
  this.loaderHide=false;
  this.main.getProfile().then((v)=>{this.uid=v;}).then(()=>{
  this.fb.getDataArr("users/"+this.uid+"/activity/").then((v:any)=>{
    if(v!=undefined){
      var people;
      for(var i in v){
       people=[];
      if(v[i].people!=undefined){for(var j in v[i].people){people.push(v[i].people[j]);}}
      v[i].people=people;
      this.activities=v;
    }}
  }).then(()=>{
    var date2 =  new Date(((new Date(Date.now() - tzoffset)).toISOString()).slice(0,10));
     for(var i=0 ;i<this.activities.length;i++){
       console.log(this.activities)
       var date1 = new Date(this.activities[i].time.day);
       var timeDiff = Math.abs(date2.getTime() - date1.getTime());
       var diffDays = Math.ceil(timeDiff / (1000 * 3600 * 24));
       var eventHours=this.activities[i].time.time;
       var daySplit;
       eventHours = eventHours.split(":");
       var eventTime=parseInt(eventHours[0]);
       if(eventHours[0].length==1){eventHours[0]=(0).toString()+eventHours[0]}
       daySplit = this.activities[i].time.day.split("-");
       if (eventTime==12 && this.activities[i].time.ampm=="am") {eventTime=0;}
       else if (eventTime==12 && this.activities[i].time.ampm=="pm") {eventTime=12;}
       else if (this.activities[i].time.ampm=="pm") {eventTime=eventTime+12;}

      if(eventTime>9){this.activities[i].timestamp=daySplit[0].toString()+daySplit[1]+daySplit[2]+eventTime+eventHours[1]}
      else{this.activities[i].timestamp=daySplit[0].toString()+daySplit[1]+daySplit[2]+"0"+eventTime+eventHours[1]}
      this.activities[i].timestamp=parseInt(this.activities[i].timestamp);
          daySplit[0]=parseInt(daySplit[0]);
          daySplit[1]=parseInt(daySplit[1]);
          daySplit[2]=parseInt(daySplit[2]);
          var stringTimestamp=this.activities[i].timestamp.toString();
          var stringToday=this.today.toString();
          if(this.activities[i].timestamp+7640< this.today+200+7640 && this.activities[i].timestamp+7640> this.today-200+7640){this.activities[i].time.date="Now";}
          else if(parseInt(stringTimestamp)<parseInt(stringToday)){this.activities[i].time.date="Done";}
          else if(stringTimestamp.slice(4,8)==stringToday.slice(4,8)){this.activities[i].time.date="Today";}
          else if(diffDays==1){this.activities[i].time.date="Tomorrow";}
          else{this.activities[i].time.date=this.activities[i].time.day2}
     }
  }).then(()=>{
    this.activities.sort((a, b)=>{
      if (new Date(a.timestamp) > new Date(b.timestamp))return 1;
      if (new Date(a.timestamp) < new Date(b.timestamp))return -1;
      return 0;
    })}).then(()=>{
    var no=0;
     for(var i=0 ;i<this.activities.length;i++){
      var item=[];
      for (let one in this.activities[i].admins) {
        item.push(this.activities[i].admins[one]);
    }
    this.activities[i].admins2= item;

       if(i!=0 && this.activities[i].time.date!=this.activities[i-1].time.date){
         no++;
         this.x[no]=[];
         this.x[no].push(this.activities[i])
        }
         else{
           this.x[no].push(this.activities[i]);
         }
     }}).then(()=>{
       console.log(this.activities)
       if(this.x[0][0]!=undefined){
     if(this.x[0][0].time.date=="Done"){
     this.x.push(this.x[0]);
     this.x.shift();}}
     this.activities=this.x;
     this.loaderHide=true;
     console.log(this.activities)

})})
}

openActivity(p){
  this.event.publish('navigate:activity',{activity:[p.id,p.state]})
}

unjoin(x){
  var y= x.time.day;
  var index;
for(var i = 0;i<this.activities.length;i++){
  for(var j = 0;j<this.activities[i].length;j++){
  if(this.activities[i][j]==x){index=[i,j]}
}}
this.main.deleteData("users/"+this.uid+"/activity/"+this.activities[index[0]][index[1]].id)
this.activities[index[0]].splice(index[1],1);
}


join(ev,i,j){
  ev.stopPropagation()
  if(this.activities[i][j].state=="invited"){
      this.activities[i][j].state="joined";
        this.main.increase("/users/"+this.uid+"/profile/0/joinNo");
      this.main.setData("users/"+this.uid+"/activity/"+this.activities[i][j].id+"/state/","joined");
      this.main.moveFbRecord("/mainData/Activities/"+this.activities[i][j].id+"/invited/"+this.uid ,  "/mainData/Activities/"+this.activities[i][j].id+"/joined/"+this.uid);
  }
  else if(this.activities[i][j].state=="cantJoin"){
      this.activities[i][j].state="joined";
        this.main.increase("/users/"+this.uid+"/profile/0/joinNo");
      this.main.setData("users/"+this.uid+"/activity/"+this.activities[i][j].id+"/state/","joined");
      this.main.moveFbRecord("/mainData/Activities/"+this.activities[i][j].id+"/cantJoin/"+this.uid ,  "/mainData/Activities/"+this.activities[i][j].id+"/joined/"+this.uid);
  }
}
}
