import { Injectable,NgZone  } from '@angular/core';
import * as firebase from 'firebase';
import 'rxjs/add/operator/map';
import { LaunchNavigator, LaunchNavigatorOptions } from '@ionic-native/launch-navigator';
import {AlertController,Platform} from 'ionic-angular';
import { Diagnostic } from '@ionic-native/diagnostic';
import { Geolocation, Geoposition } from '@ionic-native/geolocation';
import { Storage } from '@ionic/storage';
import { Events } from 'ionic-angular';
declare var GeoFire: any

@Injectable()
export class LocationTracker {
  public watch: any="";
  public lat: number = 0;
  public lng: number = 0;
  public total:any;
  public uid:any;
  public firebaseRef:any;
  public test:any;
  public GeoFire:any;
  constructor( public zone: NgZone,public storage:Storage,public geolocation:Geolocation,public plt:Platform,
    public events: Events,public diagnostic: Diagnostic,public alertCtrl: AlertController,private launchNavigator: LaunchNavigator) {
      setTimeout(()=>{
this.firebaseRef = firebase.database().ref("/mainData/location/");
this.GeoFire = new GeoFire(this.firebaseRef);
},2000)
  }

  // ======================================================================================================================================
  // upload position

update(x){
    if(x!=undefined){
    this.storage.get('uid').then((value) => {
    if(value!=null){
    this.uid = value;
    console.log(this.uid);
    console.log(x)
    this.GeoFire.set(this.uid, x).then(function() {
    }, function(error) {console.log("Error: " + error+"'");})}})}
}
// ==========================================================================================================
// clear watch
clearWatchLocation(){
  this.watch.unsubscribe();
}
// =========================================================================================================================================
//  get near people

getNear(x,list1,list2,list3,list1t,list2t,list3t,list4,list5,list6,list7,list8,list9,state,total,interest,friendlist,friendlistF,uid=this.uid ,events=this.events){
    this.storage.get("gps").then((v)=>{
    //  v==[29.98798,31.428043];   //test code
    // console.log(v,x);
    var geoQuery
      if(v!=undefined){
if(state=="gps"){ geoQuery = this.GeoFire.query({center: v,  radius: x});}
else{geoQuery = this.GeoFire.query({center: state,  radius: x});}
  geoQuery.on("key_entered", function(key, location, distance) {
    console.log(key);
    if(key!=uid){
    firebase.database().ref("/users/").child(key).once("value").then((snapshot)=>{
            var data:any;
            data=snapshot.val();
            data.key=key;
            delete data.activity;
            delete data.notification;
            delete data.suggests;
            delete data.profile[0].pass;
              if(total!=undefined){
            for(var j=0; j<data.interests.length;j++){
              if(data.interests[j].name==interest){data.mark=true;}
            }}
            if(total!=""){
              for (var i=0;i<total.length;i++){
                if(total[i].key==key){
                  events.publish("nearby:done",x);
                   if(distance<1){list1.push(data); list1t.push(data);}
                   else if(distance<20){  list2.push(data); list2t.push(data);}
              }
            }}
            else{
             if(data.profile[0].available=="all"){
              if(distance<6){list1.push(data); list1t.push(data)}
              else if(distance<10){  list2.push(data); list2t.push(data)}
              else if(distance<20){  list3.push(data); list3t.push(data)}}
            if(data.profile[0].available=="friends" || data.profile[0].available=="all"){
              console.log(friendlist);
              for(let i=0;i<friendlist.length;i++){
                if(friendlist[i].key==key){
                  friendlist.splice(i, 1);
                  friendlistF.splice(i, 1);
                  if(distance<6){list4.push(data); list7.push(data);}
                  else if(distance<10){  list5.push(data); list8.push(data);}
                  else if(distance<20){  list6.push(data); list9.push(data);}
                }
              }
            }
            }
    })
  }
  },function(error) {console.log(error)})
  geoQuery.on("ready", ()=> {
});}
})
}



testGps(page){
      this.diagnostic.isLocationEnabled().then((isAvailable) => {
        console.log(isAvailable)
     if(isAvailable!=true && page=="place"){this.viewMessagePlace("GPS is not enabled, Do you want to enable it now?","GPS")}
   })
}
// ======================================================================================================================================
// start gps Tracking

start(page){

  return new Promise((resolve,reject)=>{
   if(this.watch!=""){this.watch.unsubscribe();}
      this.diagnostic.isLocationAuthorized().then((isEnabled) => {
        this.test=isEnabled;
              // Foreground Tracking
              if(this.test==true){
                var lastUpdateTime=20;
              let options = {enableHighAccuracy: true};
              this.watch = this.geolocation.watchPosition(options).subscribe(position => {
                var now = new Date().getTime();
                if((now - lastUpdateTime) > 300000){
                  lastUpdateTime = now;
               this.storage.get("autho").then((v)=>{
                if ((position as Geoposition).coords != undefined) {
                  var geoposition = (position as Geoposition);
                  console.log('Latitude: ' + geoposition.coords.latitude + ' - Longitude: ' + geoposition.coords.longitude);
                  this.lat = position.coords.latitude;
                  this.lng = position.coords.longitude;
                  this.total=[this.lat,this.lng];
                  this.events.publish('gps:changed', [this.lat,this.lng]);
                  resolve([this.lat,this.lng])
                  this.storage.set("gps",[this.lat,this.lng]);
                  console.log(v);
                  if(v==true){
                    this.storage.get("user").then((value:any)=>{
                    if(value[0].location==true){this.update([this.lat,this.lng]);}})}
                } else {}
            });}
          });
        }
        else {let interval=  setInterval(()=>{
            if(this.test==true ){
              var lastUpdateTime=20;
            let options = {enableHighAccuracy: true};
            this.watch = this.geolocation.watchPosition(options).subscribe(position => {
              var now = new Date().getTime();
              if((now - lastUpdateTime) > 300000){
                lastUpdateTime = now;
             this.storage.get("autho").then((v)=>{
              if ((position as Geoposition).coords != undefined) {
                var geoposition = (position as Geoposition);
                console.log('Latitude: ' + geoposition.coords.latitude + ' - Longitude: ' + geoposition.coords.longitude);
                this.lat = position.coords.latitude;
                this.lng = position.coords.longitude;
                this.total=[this.lat,this.lng];
                this.events.publish('gps:changed', [this.lat,this.lng]);
                resolve([this.lat,this.lng])
                this.storage.set("gps",[this.lat,this.lng]);
                console.log(v);
                if(v==true){
                  this.storage.get("user").then((value:any)=>{
                  if(value[0].location==true){this.update([this.lat,this.lng]);}})}
              } else {}
          });}
        });
              clearInterval(interval);}
              // else if(opened=="done"){clearInterval(interval); }
              else{
                this.geolocation.getCurrentPosition({enableHighAccuracy: false})
                this.diagnostic.isLocationAuthorized().then((isEnabled) => {this.test=isEnabled})
              }
          },1000)}
})
// if( this.plt.is('ios')){
//   var lastUpdateTime=20;
// let options = {enableHighAccuracy: true};
// this.watch = this.geolocation.watchPosition(options).subscribe(position => {
//   var now = new Date().getTime();
//   if((now - lastUpdateTime) > 300000){
//     lastUpdateTime = now;
//  this.storage.get("auth").then((v)=>{
//   if ((position as Geoposition).coords != undefined) {
//     var geoposition = (position as Geoposition);
//     console.log('Latitude: ' + geoposition.coords.latitude + ' - Longitude: ' + geoposition.coords.longitude);
//     this.lat = position.coords.latitude;
//     this.lng = position.coords.longitude;
//     this.total=[this.lat,this.lng];
//     this.events.publish('gps:changed', this.total);
//     resolve(this.total)
//     this.storage.set("gps",this.total);
//     if(v==true){
//     this.storage.get("user").then((value:any)=>{
//     if(value[0].location==true){this.update(this.total);}})}
//   } else {}
// });}
// });
// }
})
}

// =========================================================================================
// view messages
 viewMessagePlace(x,y){
   let alert = this.alertCtrl.create({
       message: x
      });
     alert.setTitle(y);
     alert.addButton({text:"No",});
     alert.addButton({text:"Ok",
                      handler: () =>{this.diagnostic.switchToLocationSettings();}});
     alert.present();
 }
// =====================================================================================================================================
// open navigator

openNavigator(x){
  let options: LaunchNavigatorOptions = {};
  this.launchNavigator.navigate(x, options)
    .then(success => console.log('Launched navigator'),error => console.log('Error launching navigator', error))
}

// ======================================================================================================================================
// stop gps Tracking

// stop(){
//   console.log('stopTracking');
//   this.backgroundGeolocation.finish();
//   this.watch.unsubscribe();
//   this.backgroundGeolocation.stop();
// }

// start(){
// const config: BackgroundGeolocationConfig  = {desiredAccuracy: 0,stationaryRadius: 20,distanceFilter: 10,debug: false,interval: 2000};
//     this.backgroundGeolocation.configure(config).subscribe((location: BackgroundGeolocationResponse) => {
//     // Run update inside of Angular's zone
//       this.zone.run(() => {
//         this.lat = location.latitude;
//         this.lng = location.longitude;
//         this.total=[this.lat,this.lng];
//       });}, (err) => {console.log(err)});
//     // Turn ON the background-geolocation system.
//   this.backgroundGeolocation.start();
// }

}
