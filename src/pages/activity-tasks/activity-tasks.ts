import { ActivityTaskPopupPage } from './../activity-task-popup/activity-task-popup';
import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ModalController,Events } from 'ionic-angular';
import { MainProvider }from '../../providers/main/main';

@IonicPage()
@Component({
  selector: 'page-activity-tasks',
  templateUrl: 'activity-tasks.html',
})
export class ActivityTasksPage {

  private temp:string;
  private tasks:any=[];
  private id:any;
  public modal:any ;
  private uid:any;

  constructor(public navCtrl: NavController, public navParams: NavParams ,private main:MainProvider, private modalCtrl: ModalController,private event:Events) {
    this.id=this.navParams.get('id');
    this.main.lStorageget("uid").then((v) => { this.uid = v; })
    event.subscribe('ActivityTask',(v)=>{
      if(v.state==='edit'){
        for(var i in this.tasks){
          if(this.tasks[i].id===v.data.id){this.tasks[i]=v.data;}
        }
      }
      else{this.tasks.push(v.data);}
    })
  }

  ionViewDidLoad() {
    this.main.getData("mainData/Activities/" + this.id + "/tasks/",null,null,null,null,null).then((v)=>{
      for (var i in v){
        v[i].id=i;
        this.tasks.push(v[i])
      }
    })
  }
  pressEvent(ev,data){
    if(data.author===this.uid){
      document.getElementById("rm"+data.id).style.display="inline"
      document.getElementById("ed"+data.id).style.display="inline"
      this.temp=data.id;}
  }
  edit(data,i){
    this.modal= this.modalCtrl.create(ActivityTaskPopupPage, { id: this.id ,taskId:data.id,data:data},{cssClass: 'profileContent'});
    this.modal.present();
  }
  remove(data,i){
    this.main.viewMassageTwoValues("Are you sure, you will remove this task?","Note").then((v)=>{
        if(v=="yes"){
           this.tasks.splice(i,1);
           this.main.deleteData("mainData/Activities/" + this.id + "/tasks/"+data.id);
        }
    })
  }
  unfocus(ev){
    if(ev.path[0].id != this.temp && ev.path[1].id != this.temp && ev.path[2].id != this.temp ){
     var  elems = document.getElementsByClassName("removeButton");
      for (let i = 0; i<elems.length; i++) {
        (elems[i] as HTMLElement).style.display = "none";
    }
    elems = document.getElementsByClassName("editButton");
    for (let i = 0; i<elems.length; i++) {
      (elems[i] as HTMLElement).style.display = "none";
    }
    }
  }
  createNew(){
    this.modal= this.modalCtrl.create(ActivityTaskPopupPage, { id: this.id },{cssClass: 'profileContent'});
    this.modal.present();
  }
}
