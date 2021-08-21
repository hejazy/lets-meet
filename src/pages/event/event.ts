import { Component, ViewChild } from '@angular/core';
import { IonicPage, NavController, NavParams, Platform } from 'ionic-angular';
import { WhoPage } from '../who/who';
import { MainProvider } from '../../providers/main/main';
import { HomePage } from '../home/home';
import { ActivitiesPage } from '../activities/activities';
import { ActivityPage } from '../activity/activity';
import { PublicActivitiesPage } from '../public-activities/public-activities';

var month = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
var weekday = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
var tzoffset = (new Date()).getTimezoneOffset() * 60000;;



@IonicPage()

@Component({
  selector: 'page-event',
  templateUrl: 'event.html',
})
export class EventPage {
  public activity: any;
  public h: any = [];
  public hm: any = [];
  public col: any = '';
  public new: any;
  public daysList: any;
  public daysList2: any;
  public default: string;
  public diffDays: any;
  public res: any = "";
  eventDate: string;
   public uid:any;

  constructor(public navCtrl: NavController, public navParams: NavParams, public main: MainProvider) {
        this.main.lStorageget('uid').then((v)=>{
          this.uid=v;
        })
  }
  ionViewDidLoad() {
    this.getLists();
    this.activity = this.navParams.get('place');
    if (!this.activity) {
      this.activity = this.navParams.get('edit');
    }
  }
  // ========================================================================================================
  // get lists
  getLists() {
    this.timing().then(() => {
      this.col = [{
        name: 'col1',
        options: this.daysList
      }, {
        name: 'col2',
        options: this.h,
        columnWidth: "15%"
      }, {
        name: 'col3',
        options: this.hm,
        columnWidth: "15%"
      }, {
        name: 'col4',
        options: [{ text: "am", value: "am" }, { text: "pm", value: "pm" }],
        columnWidth: "15%"
      }
      ]
    });
  }
  changed() {
    setTimeout(() => {
      this.res = this.default.split(" ");
      var date1 = new Date(this.res[0]);
      var date2 = new Date(this.eventDate);
      var timeDiff = Math.abs(date2.getTime() - date1.getTime());
      this.diffDays = Math.ceil(timeDiff / (1000 * 3600 * 24));
      this.activity.time = { day: this.res[0], day2: this.daysList2[this.diffDays], time: this.res[1] + ":" + this.res[2], ampm: this.res[3] };
      this.new = this.daysList[this.diffDays].text + " " + " " + this.res[1] + ":" + this.res[2] + " " + this.res[3];
    }, 200);
  }
  // ===================================================================================
  // time

  timing() {
    return new Promise((resolve, reject) => {
      this.eventDate = (new Date(Date.now() - tzoffset)).toISOString();
      this.eventDate = this.eventDate.slice(0, 10);
      var week = weekday[(d => new Date(d.setDate(d.getDate())))(new Date).getDay()];
      var mon = month[(d => new Date(d.setDate(d.getDate())))(new Date).getMonth()]
      var dayno = (d => new Date(d.setDate(d.getDate())))(new Date).getDate();
      this.daysList = [{ text: "Today", value: this.eventDate }]
      this.daysList2 = [week + " " + dayno + " " + mon]
      for (var i = 1; i < 360; i++) {
        var day = (d => new Date(d.setDate(d.getDate() + i)))(new Date(Date.now() - tzoffset)).toISOString();
        day = day.slice(0, 10);
        let week = weekday[(d => new Date(d.setDate(d.getDate() + i)))(new Date).getDay()];
        let mon = month[(d => new Date(d.setDate(d.getDate() + i)))(new Date).getMonth()]
        let dayno = (d => new Date(d.setDate(d.getDate() + i)))(new Date).getDate();
        if (i == 1) { this.daysList.push({ text: "Tomorrow", value: day }); this.daysList2.push(week + " " + dayno + " " + mon); }
        else { this.daysList.push({ text: week + " " + dayno + " " + mon, value: day }); this.daysList2.push(week + " " + dayno + " " + mon); }
      }
      for (var i = 0; i < 60; i++) {
        if (i < 10) { this.hm.push({ text: ("0" + i).toString(), value: ("0" + i).toString() }) }
        else { this.hm.push({ text: (i).toString(), value: (i).toString() }) }

      }
      for (var i = 1; i < 13; i++) {
        this.h.push({ text: (i).toString(), value: (i).toString() })
      }
      resolve(this.daysList)
    })
  }


  openPage() {
    if (this.res == "") { this.main.viewMassageOneValue(`<p>Please pick a time for the activity.</p><br><p>Feeling indecisive? You can always make changes later.</p>`, "") }
    else {
      var h = parseInt(this.res[1])
      var m = parseInt(this.res[2])
      if (h == 12 && this.activity.time.ampm == "am") { h = 0; }
      else if (h == 12 && this.activity.time.ampm == "pm") { h = 12; }
      else if (this.activity.time.ampm == "pm") { h = h + 12; }
      if (this.activity.time != undefined) {
        if (this.activity.time.day == this.eventDate && h <= (new Date).getHours() && m <= (new Date).getMinutes()) {
          this.main.viewMassageOneValue("This time is not valid.", "")
        }
        else {
          if (this.activity.id) {
            let people = Object.assign({}, this.activity.invited, this.activity.joined);

            this.main.setData("mainData/Activities/" + this.activity.id + "/time", this.activity.time).then(() => {
              if (this.activity.type) {
                this.main.setData("mainData/publicActivities/"+ this.activity.id + "/time", this.activity.time).then(()=>{
                this.navCtrl.setRoot(HomePage);
                this.navCtrl.push(PublicActivitiesPage);
                this.navCtrl.push(ActivityPage, { activity: [this.activity.id], public: true });
                })
              } else {

                this.main.setData("/users/" + this.uid + "/activity/" + this.activity.id +"/time", this.activity.time).then(() => {
                  for (let i in people) {
                    this.main.setData("/users/" + i + "/activity/" + this.activity.id + "/time", this.activity.time)
                  }
                }).then(() => {
                  this.navCtrl.setRoot(HomePage);
                  this.navCtrl.push(ActivitiesPage);
                  this.navCtrl.push(ActivityPage, { activity: [this.activity.id, "joined"] });
                })
              }
            })
          } else {
            this.navCtrl.push(WhoPage, { who: this.activity });
          }
        }
      }
      else { this.main.viewMassageOneValue(`<p>Please pick a time for the activity.</p><br><p>Feeling indecisive? You can always make changes later.</p>`, "") }
    }
  }



}
