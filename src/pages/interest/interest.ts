import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams,Events } from 'ionic-angular';
import { DomSanitizer } from '@angular/platform-browser';
import { MenuController } from 'ionic-angular';
import { MainProvider }from '../../providers/main/main';
import { HomePage } from '../home/home';

@IonicPage()
@Component({
  selector: 'page-interest',
  templateUrl: 'interest.html',
})
export class InterestPage {
public interests:any=[];
public myInterests:any=[];
public loaderHide:boolean=false;
public uid:string;
public interestsF:any=[];
public interestDone:any=false;
public mySuggests:any=[];
public keyboardhide:boolean=false;
  constructor(public navCtrl: NavController, public navParams: NavParams,private sanitizer: DomSanitizer,public main:MainProvider,public event:Events) {
    // window.addEventListener('native.keyboardshow', (e) => {this.keyboardhide=true});
    // window.addEventListener('native.keyboardhide', () => {this.keyboardhide=false});
    }
  ionViewDidLoad() {
    // this.main.lStorageget("interestsdone").then((v:any)=>{this.interestDone=v})
    // this.event.subscribe("noInternet:change", (userData) => {
    //   if(userData==true){this.loaderHide=true;}
    // })
 this.main.lStorageget("uid").then((v:any)=>this.uid=v).then(()=>{
  // this.main.getData("/mainData/interests/","","","","","").then((v:any)=>{
  //   for(var i in v){
  //     v[i].check=false;
  //     var data=  v[i].name.split(" ");
  //     v[i].name="";
  //     for(var j=0;j< data.length; j++){
  //       if(j!=0){v[i].name=v[i].name+"\n"+data[j]}
  //       if(j==0){v[i].name=data[j]}}
  //   this.interests.push(v[i]);
  //   this.interestsF.push(v[i]);
  // }
  // }).then((v)=>{
     this.main.getData("/users/"+this.uid+"/interests/",null,null,null,null,null).then((v:any)=>{
       for(let i in v){
         this.interests.push(v[i]);
         this.interestsF.push(v[i]);
       }
       this.loaderHide=true;
      // this.myInterests=v;
    })
//     .then((v)=>{
//     //    if(this.myInterests==null){this.myInterests=[]}
//     // for(var i=0; i<this.interests.length;i++){
//     //   for(var j=0 ; j<this.myInterests.length;j++){
//     //     if(this.interests[i].name==this.myInterests[j].name){this.interests[i].check=true;}}
//     //   }
//   // })
// }).then(()=>{
//   this.main.getData("/users/"+this.uid+"/suggests/",null,null,null,null,null).then((v:any)=>{if(v!=undefined){this.mySuggests=v;}})
// }).then(()=>{
//    this.loaderHide=true;})
  })
}


//  // ==================================================================================================================================
//  // done and save interests
//  done(){
//    var tag="";
//    return new Promise((resolve,reject)=>{
//      this.myInterests=[];
//    for (var i = 0; i < this.interests.length; i++){
//     if(this.interests[i].check==true){
//       delete this.interests[i].check;
//       this.myInterests.push(this.interests[i]);
//        }
//     }
//     resolve("x");
// }).then(()=>{
// for(var i=0;i<this.myInterests.length;i++){tag=tag+this.myInterests[i].name+", "; console.log(tag); if(i==this.myInterests.length-1){this.main.onesignalSetTag("interests",tag);}}
//   if(this.myInterests==null){this.myInterests=""}
//     if(this.myInterests!="" || this.myInterests.length!=0){
//       console.log(this.myInterests)
//     this.main.setData("/users/"+this.uid+"/interests/",this.myInterests);
//     if(this.interestDone==true){this.navCtrl.setRoot(HomePage,{firstTime:"no"});}
//     else{this.main.lStorageset("interestsdone",true); this.navCtrl.setRoot(HomePage,{firstTime:"yes"});}}
//  else{this.main.viewMassageOneValue(`<p>I'm sure you're more interesting than you think.</p><br><p>Tap on at least 1 interest or vote for any interest - no matter how bizarre.</p>`,"");}
// })
//  }
 // ==========================================================================================
// search interests
search(ev:any){
  this.interestsF=this.interests;
  var val=ev.target.value;
  this.interestsF = this.interests.filter((v) => {
      if (v.name.toLowerCase().indexOf(val.toLowerCase()) > -1) {  return true;}
  })
}
// // =========================================================================================
// // user suggest new interest function
// suggestNewInterest(x){
//   this.loaderHide=false;
//   for(var i in this.mySuggests){
//     if(x==this.mySuggests[i]){this.main.viewMassageOneValue("you suggest this interest before.","");this.loaderHide=true; return;}
//   }
//   this.main.setData("/users/"+this.uid+"/suggests/"+ this.mySuggests.length ,x);
//   this.mySuggests.push(x);
//   this.main.increase("AdminArea/SuggestedInterests/"+x);
//   this.loaderHide=true;
//   this.main.viewMassageOneValue("We kindly recieved your suggestion.","Thank You");
//       // Test code
//   // this.main.checkExist("AdminArea/SuggestedInterests/"+x).then((v)=>{
//   //   if(v=="false"){
//   //     this.loaderHide=true;
//   //     this.main.setData("AdminArea/SuggestedInterests/"+x,{name:x,count:1})
//   //     this.main.viewMassageOneValue("We kindly recieved your suggestion.","Thank You");
//   // }
//   //   else if(v=="true"){this.main.getData("AdminArea/SuggestedInterests/"+x+"/count",null,null,null,null,null).then((value:any)=>{
//   //     var newData =parseInt(value)+1;
//   //     this.loaderHide=true;
//   //       this.main.setData("AdminArea/SuggestedInterests/"+x+"/count",newData);
//   //       this.main.viewMassageOneValue("We kindly recieved your suggestion.","Thank You");
//   //   })
//   // }
//   // })

// }
}
