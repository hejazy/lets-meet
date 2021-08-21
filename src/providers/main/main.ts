import { Injectable, } from '@angular/core';
import {AlertController,MenuController,ToastController,Events} from 'ionic-angular';
import 'rxjs/add/operator/map';
import {Md5} from 'ts-md5/dist/md5';
import { Storage } from '@ionic/storage';
import * as firebase from 'firebase';
import { Camera ,CameraOptions } from '@ionic-native/camera';
import { OneSignal } from '@ionic-native/onesignal';
import { Network } from '@ionic-native/network';
import { NativeAudio } from '@ionic-native/native-audio';
import { Platform } from 'ionic-angular';
import { LocalNotifications } from '@ionic-native/local-notifications';
import { BackgroundMode } from '@ionic-native/background-mode';
import { FilePath } from '@ionic-native/file-path';
import { File } from '@ionic-native/file';
import { FileChooser } from '@ionic-native/file-chooser';
import { FileTransfer, FileUploadOptions, FileTransferObject } from '@ionic-native/file-transfer';


var tzoffset=(new Date()).getTimezoneOffset() * 60000;;
var progress;
@Injectable()
export class MainProvider {
  public uid:string;                     //for easy pass data to many paths in firebase json
  audioType: string = 'html5';           // sounds for notification
  sounds: any = [];                      // sounds for notification
  public alert:any;                      // used in hardware back button "android" to close alert if it clicked
  public openedId:string="";             // used to stop listen to notification of messages when user read it and start messenger notification
  public connectiontest:boolean=true;    //connection state "still test"

  constructor(public storage: Storage,public alertCtrl: AlertController,public menuCtrl: MenuController,private camera: Camera,private oneSignal: OneSignal,
  public network:Network,public toastCtrl: ToastController, public event:Events,public nativeAudio: NativeAudio,public plt: Platform,
  public localNotifications: LocalNotifications,public backgroundMode: BackgroundMode,public fileChooser: FileChooser,private file: File,
  public filePath: FilePath,public transfer: FileTransfer,) {
    this.lStorageget("uid").then((v:any)=>{this.uid=v;
       this.backgroundMode.enable();
       this.localNotifications.on("click").subscribe((notification) => {this.event.publish("notification:clicked",notification.data)});
       this.backgroundMode.setDefaults({title:  "Synk",  text: "Running",silent:true});
       this.startBackgroundNotification();
    })
    this.event.subscribe('popup:false', () => {this.alert.dismiss();})

  }
  // ===================================================================================================================
// startin background-mode
startBackgroundNotification(){
  this.plt.ready().then(() => {
  this.plt.pause.subscribe(() => {
    this.storage.get("user").then((v)=>{
      if(v[0].notification==true){
    var first=false;
    var message="";
    this.stopListen("/users/"+this.uid+"/notification/").then(()=>{
        firebase.database().ref("/users/"+this.uid+"/notification/").orderByChild('timestamp').limitToLast(1).on('value',snapshot=> {   //firebas listen to notification
        var task;  var m;  var hash=0;
        task=snapshot.val();
        for(var i in task){
          for(var j =0;j<task[i].id.length;j++){
            m = task[i].id.charCodeAt(j);
            hash += m;
          }
          if(task[i].new==true && first==true){
            message=task[i].message;
            this.localNotifications.schedule([{  id: hash,  text: task[i].message,  data:task[i].id}]);
          }
        }
        first=true;
      })
    })}})
  });
this.plt.resume.subscribe(() => {
this.storage.get("user").then((v)=>{
  if(v[0].notification==true){
  this.stopListen("/users/"+this.uid+"/notification/").then(()=>{
    this.getDataONnotification("/users/"+this.uid+"/notification/",25);
  })}})
})
})
}

  // ==============================================================================================
  // firebase authentication

  signupMial(x,y){  //input: email,password
    return new Promise((resolve,reject)=>{
    firebase.auth().createUserWithEmailAndPassword(x,y).catch(function(error) {        //firebase authentication
      return (error.message);}).then((v)=>{
        resolve(v);
      })})
  }

  signinMail(x,y){  //input: email,password
    return new Promise((resolve, reject) => {
    firebase.auth().signInWithEmailAndPassword(x, y).catch(function(error) {
      return(error.message);}).then((v)=>{
        resolve(v)
      })})
  }

  signin3rdparty(x){ //input: email
  return new Promise((resolve, reject) => {
  firebase.auth().signInWithCredential(x).then((success)=>{
    resolve(success)
  })})
  }

  signout(){
    return new Promise((resolve, reject) => {
      firebase.auth().signOut().then(function() {}).catch(function(error) {});
    })
  }

  // ============================================================================================
  // get firebase auth uid
  getProfile(){
  return new Promise((resolve, reject) => {
    var user = firebase.auth().currentUser;
    this.uid=user.uid;
    this.storage.set('uid',this.uid).then((v)=>{
    resolve(this.uid);
    })
  })}

  // ==============================================================================================
  // get verification key to email
  verificationMail(){
    firebase.auth().onAuthStateChanged(function(user) {
      user.sendEmailVerification();
    });
  }

  // =================================================================================================
  // check auth state
  AuthState(){
    return new Promise((resolve, reject) => {
      try{
    firebase.auth().onAuthStateChanged(function(user) {
      if (user) {resolve(true)}
      else {resolve(false)}
    });}
    catch(e){
      firebase.database().goOffline();
      setTimeout(()=>{firebase.database().goOnline();},2000)}
  })
  }

  // ==================================================================================================
  // reset password "forgot password"
  resetPassword(x){    //input: email
    return new Promise((resolve, reject) => {
    firebase.auth().sendPasswordResetEmail(x).then(function(d:any) {                                     //firebase verify your email
    resolve(d);
    },function(error) {
    resolve (error.message)})})
  }


  // ==================================================================================================
  // changing email
  updateEmail(x){    //input: password
    return new Promise((resolve, reject) => {
      firebase.auth().currentUser.updateEmail(x);
      resolve("done");
})
  }

  // ==================================================================================================
  // changing password
  updatePassword(x){   //input: password
    return new Promise((resolve, reject) => {
      firebase.auth().currentUser.updatePassword(x);
      resolve("done");
})
  }

// ========================================================================================
// get data from firebase
//passing all get database needs in one function fails because firebase reject null filter of data
getData(ref,filterFirst,filterLast,filterStart,filterEnd,filterEqual){
  return new Promise((resolve, reject) => {
    try{
   firebase.database().ref(ref).once('value').then(function(snapshot){
    return snapshot.val();
  }).then((snapshot) => {
   resolve(snapshot); })}
   catch(e){
     firebase.database().goOffline();
     setTimeout(()=>{firebase.database().goOnline();},2000)}
 })
}

getDataFilter1(ref,filterFirst,filterLast,filterStart,filterEnd,filterEqual){
  return new Promise((resolve, reject) => {
   firebase.database().ref(ref).limitToLast(filterLast).once('value').then(function(snapshot){
    return snapshot.val();
  }).then((snapshot) => {
   resolve(snapshot); })})
}


getDataFilter2(ref,filterFirst,filterLast,filterStart,filterEnd,filterEqual){
  return new Promise((resolve, reject) => {
   firebase.database().ref(ref).orderByKey().endAt(filterEnd).limitToLast(filterLast).once('value').then(function(snapshot){
    return snapshot.val();
  }).then((snapshot) => {
   resolve(snapshot); })})
}

// ===================================================================================================
// listen to new messages
getDataON(ref,messages,page,filterLast,user,id,uid=this.uid){ //input: firebase path , messages array ,name of current page, filter no, sender image,id of opened activity
  this.nativeAudio.preloadSimple('chatsound', 'assets/audio/chatsound.mp3')
  var first =false;
        this.openedId=id;
         firebase.database().ref(ref).limitToLast(1).on('value',snapshot=> {   //firebas listen to messages
         var task;
         task=snapshot.val();
         if(page=="chat"){
          for(var i in task){
           if(messages[messages.length - 1]!=undefined){
           if(task[i].uid==messages[messages.length - 1].uid && task[i].id!=messages[messages.length - 1].id ){messages[messages.length - 1].img=""}}
           if(task[i]!=undefined){
           firebase.database().ref(ref+"/"+task[i].id+"/people/"+uid).set(user);
           task[i].peoplePreview=[];
           for(var j in task[i].people){
             task[i].peoplePreview.push(task[i].people[j]);
           }
            if(messages[messages.length - 1]!=undefined){
            if(messages[messages.length - 1].id!=task[i].id){messages.push(task[i]);  this.event.publish('messages:new', "");
               if(task[i].uid!=this.uid && first==true){
                if (this.plt.is('android')) {  this.nativeAudio.play( 'chatsound').then((res) => {}, (err) => {console.log(err)})};
                 }}
          }
            else{messages.push(task[i]);
                 this.event.publish('messages:new', "");
              if(task[i].uid!=this.uid && first==true){
                if (this.plt.is('android')) {    this.nativeAudio.play( 'chatsound').then((res) => {}, (err) => {console.log(err)});}
              }
           }
          }
        }}
          if(page=="activity"){
              for(var k in task){
                if(task[j]!=undefined){
                  if(task[j].people[this.uid]!=undefined){this.event.publish("newChatMessage:change", false)}
                  else if(first==true){
                     this.event.publish("newChatMessage:change", true);
                     if (this.plt.is('android')) {  this.nativeAudio.play('chatsound').then((res) => {}, (err) => {});}
                    }
                  else{this.event.publish("newChatMessage:change", true);}
              }
                else{this.event.publish("newChatMessage:change", false)}
              }
          }
          first=true;
  })
}

searchData(ref,queryText,returnArr){
  return new Promise((resolve, reject) => {
  firebase.database().ref(ref).orderByChild("uniquName")
                 .startAt(queryText)
                 .endAt(queryText+"\uf8ff")
                 .once("value").then(function(snapshot){
                   var data=snapshot.val();
                  for(var childSnapshot in data) {
                    let item = data[childSnapshot];
                    item.key=childSnapshot;
                    returnArr.push(item);
                }
                 });
                resolve("") })
}
// ===================================================================================================
// listen to notification
getDataONnotification(ref,filterLast){  //input: firebase path , notification filter "default 25"
  this.stopListen("/users/"+this.uid+"/notification/").then(()=>{
  this.nativeAudio.preloadSimple('notification','assets/audio/notification.mp3');
  firebase.database().ref(ref).orderByChild("timestamp").limitToLast(filterLast).on('value',snapshot=> {   //firebas listen to notification
  this.storage.get("user").then((v)=>{
  var task;
  task=snapshot.val();
  for(var i in task){
    if(task[i].new==true && v[0].notification==true && this.openedId!=task[i].id){
    this.event.publish("notificatin:new","");
    if (this.plt.is('android')) {  this.nativeAudio.play('notification').then((res) => {}, (err) => {});}}
  }
})})})
}
// =================================================================================================
// listen of data
getFriendsON(ref,friends,friendsF){  //input: firebase path , notification filter "default 25"
return new Promise((resolve, reject) => {
  var m;
  firebase.database().ref(ref).on('value',snapshot=> {   //firebas listen to notification
  m=snapshot.val();
  for(var i in m){if(i!=this.uid){m[i].key=i; friends.push(m[i]);friendsF.push(m[i])}};
  setTimeout(()=>{this.stopListen(ref);},4000);
  resolve("done");
})})
}

// =================================================================================================
// listen of data
getWithChild(ref){  //input: firebase path , notification filter "default 25"
return new Promise((resolve, reject) => {
  firebase.database().ref(ref).orderByKey().limitToLast(10).once('value').then(snapshot=> {   //firebas listen to
  resolve(snapshot.val());
})})
}

// =================================================================================================
// listen of data
getWithChildCont(ref,startAt){  //input: firebase path , notification filter "default 25"
return new Promise((resolve, reject) => {
  firebase.database().ref(ref).orderByKey().endAt(startAt).limitToLast(10).once('value').then(snapshot=> {   //firebas listen to
  resolve(snapshot.val());
})})
}
// ===================================================================================================
// stop Listen to firebase data
stopListen(ref){    //input: firebase path
  return new Promise((resolve, reject) => {
    this.openedId="";
   firebase.database().ref(ref).off();
   resolve("done");
 })
}
// =====================================================================================================
// increment firebase record without read it
increase(ref){ //input: firebase path
firebase.database().ref(ref).transaction(function(currentClicks) {
  return (currentClicks || 0) + 1;
});
}
// =====================================================================================================
// decrement firebase record without read it
decrease(ref){      //input: firebase path
firebase.database().ref(ref).transaction(function(currentClicks) {
  return (currentClicks) - 1;
});
}

// ======================================================================================================
// move firebase record from path to another


moveFbRecord(x, y) {  //input: move from x path to y path
     firebase.database().ref(x).once('value').then((snap)=>  {
          firebase.database().ref(y).set( snap.val(), function(error) {
               if( !error ) {  firebase.database().ref(x).remove(); }
               else if( typeof(console) !== 'undefined' && console.error ) {  console.error(error); }
          });
     });
}
// ======================================================================================================
// copy firebase record from path to another


copyFbRecord(x: string, y: string) {  //input: copy from x path to y path
  return new Promise((resolve, reject) => {
  firebase.database().ref(x).once('value').then((snap) => {
    firebase.database().ref(y).set(snap.val(), function (error) {
    }).then(()=>{resolve('scuccess')});
  })});
}

    //Test code

// getDatemultiplePlaces(x,y){
//   var promises = x.map(function(key) {
//     return firebase.database().ref("/users/").child(key).once("value");
//   });
//   Promise.all(promises).then(function(snapshots) {
//     snapshots.forEach(function(snapshot:any) {
//       var data=snapshot.val();
//       delete data.activity
//       delete data.notification
//       delete data.suggests
//         y.push(data);
//     });
//   });
// }

// ==================================================================
// set data to firebase

setData(ref,data){ //input: firebase path, data
  return new Promise((resolve, reject) => {
 firebase.database().ref(ref).set(data);
 resolve("done");
})

}


// ==================================================================
// push data to firebase

pushData(ref,data){ //input: firebase path,data
  return new Promise((resolve, reject) => {
    var myRef = firebase.database().ref(ref).push();
data.id=myRef.key;
    myRef.set(data);
    resolve(myRef.key);
 })
}

// ============================================================================
// delete path in firebase

deleteData(ref){ //input: firebase path
  return new Promise((resolve, reject) => {
    var myRef = firebase.database().ref(ref).remove();
 })
}

getData1(ref,orderby,equalTo){
  return new Promise((resolve, reject) => {
    try{
   firebase.database().ref(ref).orderByChild(orderby).equalTo(equalTo).once('value').then(function(snapshot){
    return snapshot.val();
  }).then((snapshot) => {
   resolve(snapshot); })}
   catch(e){
     firebase.database().goOffline();
     setTimeout(()=>{firebase.database().goOnline();},2000)}
 })
}
// ==================================================================
// check is data available
checkExist(ref){    //input: firebase path
  return new Promise((resolve, reject) => {
   firebase.database().ref(ref).once('value').then(function(snapshot){
    return snapshot.val();
  }).then((snapshot) => {
    if(snapshot!=undefined){resolve("true");}
    else{resolve("false")}})})
}

// =================================================================================
// localstorage

lStorageset(a,b){    //input: storage marker, data to store
  return new Promise((resolve, reject) => {
      this.storage.set(a,b).then(()=>{resolve("done")})
})
}


lStorageget(a){
  return new Promise((resolve, reject) => {
      this.storage.get(a).then((v)=>{
        resolve(v);
      });
})
}
// ========================================================================================
// view messages "alertType" with no input

viewMassageOneValue(x,y){     //input: message,title
  this.event.publish("popup:true");
  var z;
  // if(y==""){z="alertHideHeader"}
  this.alert = this.alertCtrl.create({  message: x});
  this.alert.setTitle(y);
  this.alert.addButton('Ok');
  this.alert.present();
}

// ========================================================================================
// view messages "alertType" with input password

viewMassageTwo(x,y,z){    //input: message,title,old hashed password
  return new Promise((resolve, reject) => {
    this.lStorageget("authType").then((v)=>{return v}).then((v)=>{
      if (v=="facebook"){resolve(["yes",""])}
      else{
        this.event.publish("popup:true");
  this.alert = this.alertCtrl.create({  message: x,
    inputs:[{ type : 'password' ,placeholder:"password"}],
    buttons: [
      {text: 'cancel',
        handler: () => {
          resolve("no")
        }},
      {text: 'Save changes',
        handler: (data) => {
          var pass=Md5.hashStr(data[0]);
          if(pass==z){
          resolve(["yes",data[0]])}
          else{resolve(["error",""])}
        }}
      ]});
  this.alert.setTitle(y);
  this.alert.present();}
})
})
}
// ========================================================================================
// view messages "alertType" with 2 inputs

viewMassageTwoValues(x,y){  //input: message,title
  return new Promise((resolve, reject) => {
    this.event.publish("popup:true");
  this.alert = this.alertCtrl.create({  message: x,
    buttons: [
      {text: 'cancel',
        handler: () => {
          resolve("no")
        }},
      {text: 'Continue',
        handler: (data) => {
          resolve("yes")}
        }
      ]});
  this.alert.setTitle(y);
  this.alert.present();
})
}
// ==========================================================================================
// open menu
openmenu(){
    this.menuCtrl.open();
}

// =======================================================================================
// Gallery function
gallery(){
  return new Promise ((resolve,reject)=>{
  const options: CameraOptions = {
    quality: 70,
    sourceType:0,
    targetWidth:500,
    correctOrientation:true,
    destinationType: this.camera.DestinationType.DATA_URL,
    encodingType: this.camera.EncodingType.JPEG,
    mediaType: this.camera.MediaType.PICTURE
  }

  this.camera.getPicture(options).then((imageData) => {
   var captureDataUrl = 'data:image/jpeg;base64,' + imageData;
    resolve(captureDataUrl)
  }, (err) => {})})
}
// =======================================================================================================
// camera function
cameraCap(){
  return new Promise ((resolve,reject)=>{
  const options: CameraOptions = {
    quality: 70,
    targetWidth:500,
    correctOrientation:true,
    destinationType: this.camera.DestinationType.DATA_URL,
    encodingType: this.camera.EncodingType.JPEG,
    mediaType: this.camera.MediaType.PICTURE
  }
  this.camera.getPicture(options).then((imageData) => {
    var captureDataUrl = 'data:image/jpeg;base64,' + imageData;
    resolve(captureDataUrl);
  }, (err) => {})})
}

// =============================================================================================================
// upload to firebase cloud

cloudUpload(x,uid){    //input: image url,(old code need to remove) ,user uid
  return new Promise ((resolve,reject)=>{
    let storageRef = firebase.storage().ref();
    const filename = "profile"+uid;
    const imageRef = storageRef.child(`images/${filename}.jpg`);
    if(x!=("assets/img/noImg.jpg")){
      if(x.slice(0, 4)!="http"){
  imageRef.putString(x, firebase.storage.StringFormat.DATA_URL).on('state_changed', function(snapshot){
  var getlink
   imageRef.getDownloadURL().then(function(url) {
     getlink=url;
     resolve(getlink)
   })});}
   else{
     const fileTransfer: FileTransferObject = this.transfer.create();
     fileTransfer.download(x, this.file.dataDirectory + 'profile.jpg').then((entry) => {
       console.log(entry);
       this.file.readAsDataURL(this.file.dataDirectory, 'profile.jpg').then((v)=>{
         console.log(v);
         imageRef.putString(v, firebase.storage.StringFormat.DATA_URL).on('state_changed', function(snapshot){
           var getlink
            imageRef.getDownloadURL().then(function(url) {
              getlink=url;
              resolve(getlink)
            })});
       }) }, (error) => {});}
  }
    else{
    if (this.plt.is('cordova')) {
      const fileTransfer: FileTransferObject = this.transfer.create();
      fileTransfer.download("https://firebasestorage.googleapis.com/v0/b/ephunk-f5312.appspot.com/o/images%2FnoImg.jpg?alt=media&token=e1e833b2-0ac1-4dea-9c9b-8cdff47cb740", this.file.dataDirectory + 'profile.jpg').then((entry) => {
        console.log(entry);
        this.file.readAsDataURL(this.file.dataDirectory, 'profile.jpg').then((v)=>{
          console.log(v);
          imageRef.putString(v, firebase.storage.StringFormat.DATA_URL).on('state_changed', function(snapshot){
            var getlink
             imageRef.getDownloadURL().then(function(url) {
               getlink=url;
               resolve(getlink)
             })});
        }) }, (error) => {});
    }
    else{resolve("assets/img/noImg.jpg")}
  }
  })
}

// ==============================================================================================================
// oneSignal initilize

onesignalInit(){
  return new Promise((resolve,reject)=>{
  this.oneSignal.startInit('2deaa499-9970-4426-8ebd-a3131a7b93dc', '14925938746');
  var onesignalid =this.oneSignal.getIds();
  this.oneSignal.inFocusDisplaying(this.oneSignal.OSInFocusDisplayOption.InAppAlert);
  console.log(onesignalid)
  this.oneSignal.endInit();
  resolve(onesignalid);})
}

// ==============================================================================================================
// oneSignal setTags

onesignalSetTags(x,y){       //input: age, gender
  var onesignalid =this.oneSignal.getIds();
  var date1 = new Date(x);
  var date2 =  new Date(((new Date(Date.now() - tzoffset)).toISOString()).slice(0,10))
  var timeDiff = Math.abs(date2.getTime() - date1.getTime());
  var years = Math.ceil(timeDiff / (1000 * 3600 * 24 * 365));
  this.oneSignal.sendTags({id: onesignalid ,age:years, gender:y});
}

onesignalSetTag(x,y){     //input:key,value
  this.oneSignal.sendTag(x,y);
}

// ====================================================================================================================
// connectionTest


connectionTest(){
  let disconnectSubscription = this.network.onDisconnect().subscribe(() => {
     this.event.publish("noInternet:change",true);
     this.presentToast("Chill mate. Just check your internet connection.");
     firebase.database().goOffline();
     this.connectiontest=false;
   });
  let connectSubscription = this.network.onConnect().subscribe(() => {
     this.event.publish("noInternet:change",false);
     firebase.database().goOnline();
     this.connectiontest=true;
  })
}

checkConncetion(){
  return new Promise((resolve,reject)=>{
    resolve(this.connectiontest);
  })
}
// ==============================================================================================
//  present message "toastType"
presentToast(x) {          //input: message
  let toast = this.toastCtrl.create({
    message: x,
    showCloseButton	:true,
    closeButtonText:"Ok",
  });
  toast.present();
}
}
