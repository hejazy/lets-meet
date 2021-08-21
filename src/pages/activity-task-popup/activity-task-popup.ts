import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ViewController,Events } from 'ionic-angular';
import { Renderer } from '@angular/core';
import { MainProvider } from '../../providers/main/main';
import { FormGroup, FormControl, Validators } from '@angular/forms';

@IonicPage()
@Component({
  selector: 'page-activity-task-popup',
  templateUrl: 'activity-task-popup.html',
})
export class ActivityTaskPopupPage {
  private formData = new FormGroup({
    discription: new FormControl('', Validators.required),
  });
  private user: any;
  private id: any;
  public taskId:any;
  private data:any;
  private uid:any

  constructor(public navCtrl: NavController, public navParams: NavParams, public renderer: Renderer, public viewCtrl: ViewController, public main: MainProvider,private event:Events) {
    this.renderer.setElementClass(viewCtrl.pageRef().nativeElement, 'my-popupInput', true);
    this.main.lStorageget("user").then((v) => { this.user = v; })
    this.main.lStorageget("uid").then((v) => { this.uid = v; })
    this.id = this.navParams.get('id')[0];
    this.taskId = this.navParams.get('taskId');
    this.data =this.navParams.get('data')
  }
  saveData() {
    if (!this.formData.invalid) {
      var x = this.formData.value;
      x.author=this.uid;
      x.time = Date.now();
      x.img = this.user[0].profile;
      x.name= this.user[0].name

      if(!this.taskId){
      this.main.pushData("mainData/Activities/" + this.id + "/tasks/", x);
      this.event.publish('ActivityTask',{data:x,state:'new'});
      } else{
        x.id=this.taskId;
        this.main.setData("mainData/Activities/" + this.id + "/tasks/" +this.taskId, x);
        this.event.publish('ActivityTask',{data:x,state:'edit'});
      }
      this.navCtrl.pop();
    }
  }
}
