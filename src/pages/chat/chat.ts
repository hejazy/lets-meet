import { Component ,ElementRef,Renderer,ViewChild} from '@angular/core';
import { IonicPage, NavController, NavParams ,Events,Content,Platform} from 'ionic-angular';
import { ViewController } from 'ionic-angular';
import { MainProvider }from '../../providers/main/main';
var tzoffset=(new Date()).getTimezoneOffset() * 60000;


@IonicPage()
@Component({
  selector: 'page-chat',
  templateUrl: 'chat.html',
})

export class ChatPage {
public messages:any=[];
public user:any;
public id:any;
public msg:any;
public newmessage:string="";
public refresh:boolean=false;
public firstkey:any;
public lastKey:any="";
public people:any;
public uid:string;
public day:any;
public clock:any;
public get:any;
public oldHight:any;
public kbHeight:number;


@ViewChild('scrollMe') private myScrollContainer: ElementRef;
@ViewChild(Content)  Content;

  constructor(public navCtrl: NavController, public navParams: NavParams,public viewCtrl: ViewController,public main:MainProvider
  , public renderer: Renderer,public elementRef: ElementRef, public event:Events,public plt: Platform) {
    this.time1();
    this.main.lStorageget("user").then((v)=>{this.user=v;});
    this.main.getProfile().then((v:string)=>{this.uid=v})
    this.event.subscribe("messages:new", data =>{  setTimeout(()=>{this.scrollToBottom("push","");},700) })
}

// ==========================================================================================================
// load last 20 messages and listen to messages on firebase
  ionViewDidLoad() {
    this.viewCtrl.setBackButtonText('');
    this.get =this.navParams.get('message');
    this.id=this.get[1];
    this.people=this.get[2];
    // for(var i=0; i<this.people.length;i++){if(this.people[i].key==this.uid){this.people.splice(i,1);}  }
    this.renderer.listen(this.myScrollContainer.nativeElement,'scroll', (event) => {   // listen to scroll to activate or deactivate the refresher
    if(this.myScrollContainer.nativeElement.scrollTop == 0){  this.refresh=true;}
    else{this.refresh=false;}});
    this.main.getDataFilter1("/mainData/Chat/"+this.id,null,20,null,null,null).then((task)=>{  //firebase load last 20 messages
      var keys;
          if( task!=undefined){
            this.firstkey=Object.keys(task)[0];
            for(var i in task){
              task[i].peoplePreview=[];
              for(var j in task[i].people){
                task[i].peoplePreview.push(task[i].people[j]);
              }
              if(this.lastKey!=""){if(task[i].uid==task[this.lastKey].uid){this.messages[this.messages.length - 1].img=""}}
              this.lastKey=i;
              this.messages.push(task[i]);
                }
              }
         }).then(()=>{
           this.messages.splice(-1,1);
           this.main.getDataON("/mainData/Chat/"+this.id,this.messages,"chat",1,this.user[0].profile,this.id);    //firebase listen to any new message
          setTimeout(()=>{this.scrollToBottom("start","");},700);
        })
        // .then(()=>{
        //   setTimeout(()=>{
        //     if (this.plt.is('android')) {
        //   var application = <HTMLElement>(document.getElementsByTagName('ION-APP')[0]), appHeight = application.clientHeight;
        //   window.addEventListener('native.keyboardshow', (e) => {application.style.height = (appHeight - (<any>e).keyboardHeight) + 'px';});
        //   window.addEventListener('native.keyboardhide', () => {application.style.height = '100%';});}
        // },1000);
        // })
  }

  // ==========================================================================================================
  // load old messages using refresher

  loadoldmsgs(refresher) {
     var msg=[];
     this.lastKey="";
      this.main.getDataFilter2("/mainData/Chat/"+this.id,null,15,null,this.firstkey,null).then((task)=>{ //firebase load more 15 messages
          if( task!=undefined){
            this.firstkey=Object.keys(task)[0];
            for(var i in task){
              task[i].peoplePreview=[];
              for(var j in task[i].people){
                task[i].peoplePreview.push(task[i].people[j]);
              }
              if(this.lastKey!=""){
                if(task[i].uid==task[this.lastKey].uid){msg[msg.length - 1].img=""}}
                  this.lastKey=i;
                  msg.push(task[i]);
                }}}).then((v)=>{
      msg.splice(-1,1);
      this.messages= msg.concat(this.messages);
      refresher.complete();
  })
  }

  // ==========================================================================================================
  // send notification

pushText(a,b){
  this.Content.resize();
  if(a==13 && b!=""){                                                                                   //push new message when click enter or click send on condition there is a message
    var obj = {};
    obj[this.uid] = this.user[0].profile;                                                              //mark the user as he see message
    var m={name:this.user[0].name,uid:this.uid,img:this.user[0].profile,message:b,people:obj};
    this.main.pushData("/mainData/Chat/"+this.id,m);
    this.msg={new:true,day:this.day,id:this.id, time:this.clock,timestamp:Math.floor(Date.now() / 1000),message:"you hava new messages in "+this.get[0].name+", "+this.get[3].name+" activity."}  //make notification to other users
    this.newmessage="";
      for(var i=0; i<this.people.length;i++){
        if(this.people[i].key!=this.uid){
        this.main.setData("/users/"+this.people[i].key+"/notification/"+this.id+"chat",this.msg);}
       }
  }
}

// =======================================================================================================================
// scrolldown function

scrollToBottom(x,y) {
  var z;
  if(x=="start"){this.myScrollContainer.nativeElement.scrollTop = this.myScrollContainer.nativeElement.scrollHeight;}  //scroll to bottom when opening
  if(x=="push"){                                                                                                       //scroll when new message arrived
    z=this.myScrollContainer.nativeElement.scrollHeight-this.oldHight;                                             //get height of new message
    this.myScrollContainer.nativeElement.scrollTop = this.myScrollContainer.nativeElement.scrollTop+z ;}
  else{                                                                                                     //scroll when new message arrived
    // if(y=="increase"){
    //   this.kbHeight=this.myScrollContainer.nativeElement.scrollBottom;
    //   this.myScrollContainer.nativeElement.scrollTop = this.myScrollContainer.nativeElement.scrollTop+x ;}
    // if(y=="decrease"){
    //   setTimeout(()=>{
    //     this.myScrollContainer.nativeElement.scrollBottom=this.kbHeight },30)   }                                            //get height of new message
  }
  this.oldHight=this.myScrollContainer.nativeElement.scrollHeight;
}
// ==========================================================================================================
// back function
backToActivity(){
  this.main.stopListen("/mainData/Chat/"+this.id).then(()=>{   //stop main chat listenner
    this.event.publish("chatBack:change","")                   //start chat notification listenner
  })
}

// ============================================================================================
// timer function

time1(){
 var h = new Date().getHours();
 var hm = new Date().getMinutes();
 var ampm = h >= 12 ? ' PM' : 'AM';
 h = h % 12;
 if (h===0) {h=12;}
 if(hm>10){
 this.clock = h + ':' + hm  + ampm;}
 if(hm<=10){
 this.clock = h + ':' +"0" + hm  + ampm;}
 this.day=((new Date(Date.now() - tzoffset)).toISOString()).slice(0,10);
}
}
