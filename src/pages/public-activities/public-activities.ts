import { Storage } from '@ionic/storage';
import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams,Events,MenuController } from 'ionic-angular';
import { MainProvider }from '../../providers/main/main';
import { ActivityPage } from '../activity/activity';

var tzoffset=(new Date()).getTimezoneOffset() * 60000;;
@IonicPage()
@Component({
  selector: 'page-public-activities',
  templateUrl: 'public-activities.html',
})
export class PublicActivitiesPage {
  public activities:any=[];
  public uid:any;
  public activitiesIndex:any=[];
  public x:any=[[]];
  public loaderHide:boolean=false;
  public user:any;
  public today:any=parseInt(((new Date(Date.now() - tzoffset)).toISOString()).slice(0,16).replace(/\D/g,''));
  private temp;

  constructor(public navCtrl: NavController, public navParams: NavParams,public main:MainProvider ,public event:Events,public menuCtrl:MenuController,public storage:Storage) {
  this.menuCtrl.enable(true);}


  ionViewDidLoad() {
    this.loaderHide=false;
    this.event.subscribe("noInternet:change", (userData) => {
      if(userData==true){this.loaderHide=true;}
    })
    this.event.subscribe("unjoin:done", (v)=>{
      this.loadData();
    })
    this.storage.get('user').then((v)=>this.user=v);
    this.main.getProfile().then((v)=>{this.uid=v;}).then(()=>{this.loadData()})
}



loadData(){
  this.menuCtrl.enable(true);
  this.activities=[];
  this.activitiesIndex=[];
  this.x=[[]];
  this.loaderHide=false;
  this.main.getProfile().then((v)=>{this.uid=v;}).then(()=>{
  this.main.getWithChild("mainData/publicActivities/").then((v:any)=>{
    if(v!=undefined){
    var people;
    console.log(v)
    for(var i in v){
       people=[];
      if(v[i].people!=undefined){for(var j in v[i].people){people.push(v[i].people[j]);}}
      v[i].people=people;
      this.activities.push(v[i]);
    }}
  }).then(()=>{
    this.temp=this.activities[0];
    var date2 =  new Date(((new Date(Date.now() - tzoffset)).toISOString()).slice(0,10));
     for(var i=0 ;i<this.activities.length;i++){
      if(this.activities[i].joined[this.uid]){
        this.activities[i].state='joined';
      }
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

     for(let i=0 ;i<this.activities.length;i++){
      var item=[];
      for (let one in this.activities[i].admins) {
        item.push(this.activities[i].admins[one]);
    }
    this.activities[i].admins2= item;
    item=[];
    for (let one in this.activities[i].joined) {
      item.push(this.activities[i].joined[one]);
  }
  this.activities[i].joined2= item;
       for(var j in this.activities[i].joined){
       this.activities[i].people.push(this.activities[i].joined[j])
       }
       if(i!=0 && this.activities[i].time.date!=this.activities[i-1].time.date){
         no++;
         this.x[no]=[];
         this.x[no].push(this.activities[i])
        }
         else{
           this.x[no].push(this.activities[i]);
         }
     }}).then(()=>{
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

// this.navCtrl.push(ActivityPage,{activity:[p.id],public:true})
}

doInfinite(ev){
  let tempdata=[];
  this.main.getWithChildCont("mainData/publicActivities/",this.temp.id).then((v:any)=>{
    if(v){
      var people;
      for(let i in v){
         people=[];
        if(v[i].people!=undefined){for(var j in v[i].people){people.push(v[i].people[j]);}}
        v[i].people=people;
        tempdata.push(v[i]);
      }
      tempdata.pop();
      if(tempdata[0]){
        this.temp=tempdata[0];

      var date2 =  new Date(((new Date(Date.now() - tzoffset)).toISOString()).slice(0,10));

       for(let i=0 ;i<tempdata.length;i++){
         if(tempdata[i].joined[this.uid]){
           tempdata[i].state='joined';
         }
         var date1 = new Date(tempdata[i].time.day);
         var timeDiff = Math.abs(date2.getTime() - date1.getTime());
         var diffDays = Math.ceil(timeDiff / (1000 * 3600 * 24));
         var eventHours=tempdata[i].time.time;
         var daySplit;
         eventHours = eventHours.split(":");
         var eventTime=parseInt(eventHours[0]);
         if(eventHours[0].length==1){eventHours[0]=(0).toString()+eventHours[0]}
         daySplit = tempdata[i].time.day.split("-");
         if (eventTime==12 && tempdata[i].time.ampm=="am") {eventTime=0;}
         else if (eventTime==12 && tempdata[i].time.ampm=="pm") {eventTime=12;}
         else if (tempdata[i].time.ampm=="pm") {eventTime=eventTime+12;}

        if(eventTime>9){tempdata[i].timestamp=daySplit[0].toString()+daySplit[1]+daySplit[2]+eventTime+eventHours[1]}
        else{tempdata[i].timestamp=daySplit[0].toString()+daySplit[1]+daySplit[2]+"0"+eventTime+eventHours[1]}
        tempdata[i].timestamp=parseInt(tempdata[i].timestamp);
            daySplit[0]=parseInt(daySplit[0]);
            daySplit[1]=parseInt(daySplit[1]);
            daySplit[2]=parseInt(daySplit[2]);
            var stringTimestamp=tempdata[i].timestamp.toString();
            var stringToday=this.today.toString();
            if(tempdata[i].timestamp+7640< this.today+200+7640 && tempdata[i].timestamp+7640> this.today-200+7640){tempdata[i].time.date="Now";}
            else if(parseInt(stringTimestamp)<parseInt(stringToday)){tempdata[i].time.date="Done";}
            else if(stringTimestamp.slice(4,8)==stringToday.slice(4,8)){tempdata[i].time.date="Today";}
            else if(diffDays==1){tempdata[i].time.date="Tomorrow";}
            else{tempdata[i].time.date=tempdata[i].time.day2}
       }
      tempdata.sort((a, b)=>{
        if (new Date(a.timestamp) > new Date(b.timestamp))return 1;
        if (new Date(a.timestamp) < new Date(b.timestamp))return -1;
        return 0;
      })
    }}
    }).then(()=>{
      var no=0;
      this.x=[[]];
       for(var i=0 ;i<tempdata.length;i++){
         if(i!=0 && tempdata[i].time.date!=tempdata[i-1].time.date){
           no++;
           this.x[no]=[];
           this.x[no].push(tempdata[i])
          }
           else{
             this.x[no].push(tempdata[i]);
           }
       }}).then(()=>{
         if(this.x[0][0]!=undefined){
       if(this.x[0][0].time.date=="Done"){
       this.x.push(this.x[0]);
       this.x.shift();}}
       this.activities=this.activities.concat(this.x);
       ev.complete();

  })
}

join(ev,i,j){
  ev.stopPropagation()
      this.activities[i][j].state="joined";
        this.main.increase("/users/"+this.uid+"/profile/0/joinNo");
        this.main.setData("/mainData/Activities/"+this.activities[i][j].id+"/joined/"+this.uid,{key:this.uid,profile:[{profile:this.user[0].profile,name:this.user[0].name}]});
}
}

