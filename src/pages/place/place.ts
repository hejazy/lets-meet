import { Contact } from '@ionic-native/contacts';
import { ActivityPage } from './../activity/activity';
import { Component, ViewChild, ElementRef } from '@angular/core';
 import { NavController,NavParams,Platform } from 'ionic-angular';
import { Diagnostic } from '@ionic-native/diagnostic';
import { MenuController } from 'ionic-angular';
import { EventPage } from '../event/event';
import { HomePage } from '../home/home';
import { LocationTracker } from '../../providers/gps/location-tracker';
import { Events } from 'ionic-angular';
import { MainProvider }from '../../providers/main/main';


declare var google;
import * as L from 'leaflet';
import { ActivitiesPage } from '../activities/activities';
import { PublicActivitiesPage } from '../public-activities/public-activities';
var i=0;
var mainMarker;
var secondMarker;
var seconds:any=[];
var slides;
var idNo;
@Component({
  selector: 'page-place',
  templateUrl: 'place.html',
})
 export class PlacePage {

   public place:any=[];
   public gpsOpened:boolean=false;
   public currentLocation:any;
   public val:any;
   public activity:any;
   public mappy:any=[];
   public gpsIcon:any;
   public cluster:any;
   public viewSlide:boolean=false;
   public  mainLayer:any=[];
   public secondLayer:any=[];
   public gpsLocation:any=[];
   public oldGpsLocation:any=[];
   public loaderHide:boolean=true;
   public dragged:boolean=false;
   public realGpsLocation:any=[];
   public target:any;
   public service:any;
   public request:any;
   public user:any;
   public placeDetailsHide:boolean=true;
   public details:any;
   public connectionLostHide:boolean=true;
   public keyboardhide:boolean=false;
   public uid:any;
   @ViewChild('map') map;
   @ViewChild('map1') map1;
   @ViewChild('slides') slides;

   constructor(public navCtrl: NavController, public navParams: NavParams,public menuCtrl:MenuController,public gps:LocationTracker,
      public main:MainProvider,private diagnostic: Diagnostic, public events:Events,public plt: Platform) {
        window.addEventListener('native.keyboardshow', (e) => {this.keyboardhide=true});
        window.addEventListener('native.keyboardhide', () => {this.keyboardhide=false});
        this.main.lStorageget('uid').then((v)=>{
          this.uid=v;
        })
    // if (this.plt.is('cordova')) {  this.gps.start("place");}
    this.events.subscribe('popup2:false', () => {this.placeDetailsHide=true;}) //to close place popup when back button clicked "android"
    this.events.subscribe("noInternet:change", (userData) => {   //if no internet access
      if(userData==true){this.loaderHide=true;}
      if(userData==false){setTimeout(()=>{this.ionViewDidLoad();},200)}
    })
    this.events.subscribe('gps:changed', (gpsData) => {             //if gps changed
      if(this.dragged==false){
        this.gpsLocation=gpsData;
        this.oldGpsLocation=gpsData;
        this.loadMap();
        this.findTransit(this.activity.interest.name);}
        this.events.unsubscribe("gps:changed")
    })
}
  ionViewDidLoad(){
    this.main.AuthState().then((v)=>{
    this.gps.testGps("place");
    // var script = document.createElement("script");
    // script.type = "text/javascript";
    // script.id = "googleMaps";
    // var apiKey="AIzaSyAsfhLnemhT7Kb8aBPp0tC1W6n_099VmWI";
    //   script.src = 'https://maps.googleapis.com/maps/api/js?key=' + apiKey + '&libraries=places';
    // document.body.appendChild(script);}).then(()=>{
    this.menuCtrl.enable(false);              //disable menu
    this.activity = this.navParams.get('new');  //get activity interest
    if(!this.activity){
      this.activity = this.navParams.get('edit');
    }
    if (this.plt.is('cordova')) {
    let interval = setInterval(() => {
      if(this.gpsOpened==false){
        this.diagnosticTest().then((v:boolean)=>{this.gpsOpened=v})}
        else{clearInterval(interval);
          console.log("opened")
          this.loaderHide=false;
          this.gps.start("place")}
      },1000)
      // if (this.plt.is('ios')) {
      //   this.loaderHide=false;
      //   this.gps.start("place");
      //  }
    //   for testing
    // this.gpsLocation=[29.98798,31.428043];
    // this.gpsLocation=[51.4596567,-0.0030487];
    // this.loadMap();
    // this.findTransit(this.activity.interest.name);
    }
    else{
      // for testing
        this.gpsLocation=[29.98798,31.428043];
        // this.gpsLocation=[51.4596567,-0.0030487];
        this.loadMap();
        this.findTransit(this.activity.interest.name);}
})
  }
// =======================================================================================================================================================
// check gps status
  diagnosticTest(){
    return new Promise((resolve,reject)=>{
      this.diagnostic.getLocationMode().then((v)=>{console.log(v)})
      this.diagnostic.isLocationEnabled().then((isAvailable) => {
        console.log(isAvailable)
        resolve(isAvailable);
      })
    })
  }

// ===================================================================================================================================================
// load map

   loadMap(){
     this.events.unsubscribe('gps:changed');
     this.loaderHide=false;
     mainMarker = L.icon({iconUrl: 'assets/img/locationmain.png',iconSize: [27, 40], iconAnchor: [13, 40],popupAnchor: [-3, -76] });
     secondMarker = L.icon({iconUrl: 'assets/img/locationsecond.png',iconSize: [27, 40], iconAnchor: [13, 40],popupAnchor: [-3, -76] });
     this.gpsIcon = L.icon({iconUrl: 'assets/img/gps.png',iconSize: [25, 25], iconAnchor: [13, 13],popupAnchor: [-3, -76] });
     this.mappy = L.map('map').setView([this.gpsLocation[0]-.01,this.gpsLocation[1]], 14);
     L.tileLayer('https://api.mapbox.com/styles/v1/mapbox/streets-v10/tiles/256/{z}/{x}/{y}?access_token=pk.eyJ1IjoiaGVnYXphd3kiLCJhIjoiY2o0OGZtZ2w5MGVhbjMzcXEwYWQweWRsayJ9.Z3rrb-GArBUzXNu-XMTMoQ', {
    attribution: 'Map data &copy; <a href="http://e-phunk.com">E-phunk</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>',
     maxZoom: 19,minZoom: 9,}).addTo(this.mappy);
      let latLng = new google.maps.LatLng(this.gpsLocation[0], this.gpsLocation[1]);
      this.currentLocation = latLng;
      let mapOptions = {center: latLng,zoom: 15,mapTypeId: google.maps.MapTypeId.ROADMAP}
      this.map1 = new google.maps.Map(this.map1.nativeElement, mapOptions);
      this.cluster = new L.Marker(this.gpsLocation, {icon: this.gpsIcon,draggable: true,zIndexOffset:999999});
      this.mappy.addLayer(this.cluster);
      this.cluster.on('dragend', (e)=> {
        this.loaderHide=false;
        if(this.dragged==false){  this.realGpsLocation=this.gpsLocation;}
        this.dragged=true;
        this.gpsLocation=[e.target._latlng.lat,e.target._latlng.lng];
        this.findTransit(this.activity.interest.name);
       });
    //  for testing
  //     setInterval(() => {this.diagnosticTest().then((v:boolean)=>{this.gpsOpened=v}).then((v:any)=>{
  //       if(v==true && this.gpsLocation!=this.oldGpsLocation){
  //       this.mappy.removeLayer(this.cluster);
  //       this.cluster = new L.Marker(this.gpsLocation, {icon: this.gpsIcon});
  //       this.mappy.addLayer(this.cluster);
  //       this.oldGpsLocation=this.gpsLocation;
  //     }
  //   })
  // },5000);
  }

  // ===================================================================================================================================================
  // find places

 findTransit(ev: any) {
  //  check input search and remove old pins
  this.main.checkConncetion().then((v)=>{if(v!=false){
  this.loaderHide=false;
  i=0;
   if(ev.target==undefined || ev.target.value=="") { if(this.activity.interest.name=="coffee"){this.val="coffeeshop"}else{this.val = this.activity.interest.name; }}
   if(ev.target!=undefined && ev.target.value!=""){   this.val = ev.target.value;}
   return new Promise ((resolve,reject)=>{ for (var i=0;i<seconds.length;i++) { this.mappy.removeLayer(seconds[i]);} resolve("x")
 }).then(()=>{
// setup googe places
   this.viewSlide=false;
   let latLng = new google.maps.LatLng(this.gpsLocation[0], this.gpsLocation[1]);
   this.currentLocation = latLng;
   this.request = {location: this.currentLocation,radius:'1000',keyword :this.val};
   this.service = new google.maps.places.PlacesService(this.map1);}).then(()=>{
   this.service.nearbySearch(this.request, (results, status)=> {
   if (status == google.maps.places.PlacesServiceStatus.OK) {
    this.place=[];
    seconds=[];
    this.viewSlide=true;
    // calculate distances
    if(results.length==0){this.loaderHide=true;}
    for (var j = 0; j < results.length; j++) {
          var r = 6378137;
          var p1={lat:this.gpsLocation[0],lng: this.gpsLocation[1]};
          var p2={lat:results[j].geometry.location.lat(),lng:results[j].geometry.location.lng()}
          var radp2Lat=(p2.lat) * Math.PI / 180
          var radp1Lat=(p1.lat) * Math.PI / 180
          var distanceLat = ((p2.lat - p1.lat) * Math.PI / 180);
          var distanceLng = ((p2.lng - p1.lng) * Math.PI / 180);
          var a = Math.sin(distanceLat / 2) * Math.sin(distanceLat / 2) +
          Math.cos(radp1Lat) * Math.cos(radp2Lat)*Math.sin(distanceLng / 2) * Math.sin(distanceLng / 2);
          var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
          var d = Math.round( (r * c)/1000 * 100 ) / 100;
          results[j].distance=d;
          if(results[j].rating!=null && results[j].rating!=undefined){
            results[j].rating= (results[j].rating/5)*100;
          }
          this.place.push(results[j]);
      // put pins on map
          if(j==results.length-1){this.loaderHide=true;}
          if(j==0){
              var second = new L.Marker(p2, {icon: mainMarker,zIndexOffset:9999 });
              this.mappy.addLayer(second);
              seconds.push(second);
              idNo=seconds[j]._leaflet_id;
              seconds[j].on('click', this.clicked);
              seconds[j].on("click",()=>{ this.slides.slideTo(i,500);});
          }
          else{
              // tslint:disable-next-line:no-duplicate-variable
              var second = new L.Marker(p2, {icon: secondMarker});
              this.mappy.addLayer(second);
              seconds.push(second);;
              seconds[j].on('click', this.clicked);
              seconds[j].on("click",()=>{ this.slides.slideTo(i,500);});
          }
  }}
      else{this.loaderHide=true;}})})
    }})
}
// ======================================================================================================
// open page or go back
openPage(x,y){
  if(x=='return'){this.main.lStorageget("autho").then((v)=>{if(v==true){this.menuCtrl.enable(true);}})}
  if(x=='event'){
    if(this.activity.id){
      let people =Object.assign({},this.activity.invited,this.activity.joined);
      let memory ={rating:"",photos:"",types:"",vicinity:"" }
      if(y.rating!=undefined){memory.rating=y.rating}
      if(y.photos!=undefined){memory.photos=y.photos[0].getUrl({'maxWidth': 250, 'maxHeight': 150})}
      if(y.types!=undefined){memory.types=y.types}
      if(y.vicinity!=undefined){memory.vicinity=y.vicinity}
      this.activity.place={distance:y.distance,vicinity:memory.vicinity,rating:memory.rating,icon:y.icon,name:y.name,photos:memory.photos,types:memory.types,location:[y.geometry.location.lat(),y.geometry.location.lng()]};
      this.main.setData("mainData/Activities/"+this.activity.id+"/place",this.activity.place).then(()=>{
        if(this.activity.type){
          this.main.setData("mainData/publicActivities/"+this.activity.id+"/place",this.activity.place).then(()=>{
          this.navCtrl.setRoot(HomePage);
          this.navCtrl.push(PublicActivitiesPage);
          this.navCtrl.push(ActivityPage,{activity:[this.activity.id],public:true});
          })
        } else {
          this.main.setData("/users/"+this.uid+"/activity/"+this.activity.id+"/place",this.activity.place.name).then(()=>{

            for(let i in people){
               this.main.setData("/users/"+i+"/activity/"+this.activity.id+"/place",this.activity.place.name)
            }
          }).then(()=>{
        this.navCtrl.setRoot(HomePage);
        this.navCtrl.push(ActivitiesPage);
        this.navCtrl.push(ActivityPage,{activity:[this.activity.id,"joined"]});
          })
        }
    })
    } else {
      let memory ={rating:"",photos:"",types:"",vicinity:"" }
      if(y.rating!=undefined){memory.rating=y.rating}
      if(y.photos!=undefined){memory.photos=y.photos[0].getUrl({'maxWidth': 250, 'maxHeight': 150})}
      if(y.types!=undefined){memory.types=y.types}
      if(y.vicinity!=undefined){memory.vicinity=y.vicinity}
      this.activity.place={distance:y.distance,vicinity:memory.vicinity,rating:memory.rating,icon:y.icon,name:y.name,photos:memory.photos,types:memory.types,location:[y.geometry.location.lat(),y.geometry.location.lng()]};
      this.navCtrl.push(EventPage,{place:this.activity})}
    }

}

pickThisLocation(){
  this.activity.place={rating:0,name:"Custom Location",types:"Custom Location",location:this.gpsLocation};
  let x =Object.assign({},this.activity.invited,this.activity.joined);
  if(this.activity.id){
    this.main.setData("mainData/Activities/"+this.activity.id+"/place",this.activity.place).then(()=>{
      if(this.activity.type){
        this.navCtrl.setRoot(HomePage);
        this.navCtrl.push(PublicActivitiesPage);
        this.navCtrl.push(ActivityPage,{activity:[this.activity.id],public:true});
      } else {
        this.main.setData("/users/"+i+"/activity/"+this.uid+"/place",this.activity.place.name).then(()=>{

        for(let i in x){
           this.main.setData("/users/"+i+"/activity/"+this.activity.id+"/place",this.activity.place.name)
        }
      }).then(()=>{
      this.navCtrl.setRoot(HomePage);
      this.navCtrl.push(ActivitiesPage);
      this.navCtrl.push(ActivityPage,{activity:[this.activity.id]});
    })
      }

  })
  } else {
    this.navCtrl.push(EventPage,{place:this.activity})
  }
}
// ==========================================================================================================
// slider change listener

slideChanged() {
  let currentIndex = this.slides.getActiveIndex();    //get index of current slider
  if(seconds.length>currentIndex){                   //not run in the case of last slide
  var index;
  if(i<currentIndex){index = currentIndex-1; i=currentIndex;} //check current slide position to the last slide
  if(i>currentIndex){index = currentIndex+1; i=currentIndex;}
  if(seconds[index]){
     seconds[index].setIcon(secondMarker);
     seconds[index].setZIndexOffset("0");
     seconds[currentIndex].setIcon(mainMarker);
     seconds[currentIndex].setZIndexOffset("9999");
  }}
}
// ==========================================================================================================
// pin click listener
clicked(x){
  let y= ((x.target._leaflet_id)-idNo)/2;        //get clicked pin index
  seconds[i].setIcon(secondMarker);
  seconds[i].setZIndexOffset("0");
  seconds[y].setIcon(mainMarker);
  seconds[y].setZIndexOffset("9999");
  i=y;
}
// =====================================================================================
// when the gps pin dragged user can return to his main location by this function
backtoLocation(){
  this.gpsLocation=this.realGpsLocation;
  this.mappy.panTo(new L.LatLng(this.gpsLocation[0]-.01, this.gpsLocation[1]));
  this.dragged=false;
  this.cluster.setLatLng(new L.LatLng(this.gpsLocation[0],this.gpsLocation[1]));
  this.findTransit(this.activity.interest.name);
}

// ======================================================================================
// open popup of the place detail
showPlaceDetailes(x){
  if(x=="close"){this.placeDetailsHide=true;}
  else{
   this.events.publish("popup2:true");
   this.placeDetailsHide=false;
   this.details=x;
  }
}

}
