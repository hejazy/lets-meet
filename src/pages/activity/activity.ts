import { EventPage } from "./../event/event";
import { Component, ElementRef, ViewChild } from "@angular/core";
import {
  IonicPage,
  NavController,
  NavParams,
  Content,
  Events,
  Platform,
  ModalController
} from "ionic-angular";
import { MainProvider } from "../../providers/main/main";
import { ActivitiesPage } from "../activities/activities";
import { MenuController } from "ionic-angular";
import { HomePage } from "../home/home";
import { ProfilePopupPage } from "../profile-popup/profile-popup";
import { ChatPage } from "../chat/chat";
var tzoffset = new Date().getTimezoneOffset() * 60000;
import { LocationTracker } from "../../providers/gps/location-tracker";
import { ActivityTasksPage } from "../activity-tasks/activity-tasks";
import { PlacePage } from "../place/place";

@IonicPage()
@Component({
  selector: "page-activity",
  templateUrl: "activity.html"
})
export class ActivityPage {
  public activity: any;
  public arrived: any = [];
  public away: any = [];
  public invited: any = [];
  public cantJoin: any = [];
  public joined: any = [];
  public arrivedView: any = [];
  public awayView: any = [];
  public invitedView: any = [];
  public cantJoinView: any = [];
  public joinedView: any = [];
  public showDetails: boolean = false;
  public newChatMessage: boolean = false;
  public id: any;
  public state: any;
  public uid: any;
  public listKey: any = "See All";
  public joinNo: number = 0;
  public pan: any = 0;
  public loaderHide: boolean = false;
  public eventIsNow: boolean = false;
  public total: any = [];
  public joinedMore: boolean = false;
  public arrivedMore: boolean = false;
  public noJoinMore: boolean = false;
  public awayMore: boolean = false;
  public invitedMore: boolean = false;
  public admin: boolean = false;
  public first: boolean = false;
  public public: boolean = false;
  public user: any;
  public profileModal: any = this.modalCtrl.create(
    ProfilePopupPage,
    { data: "" },
    { cssClass: "profileContent" }
  );
  public today: any = parseInt(
    new Date(Date.now() - tzoffset)
      .toISOString()
      .slice(0, 16)
      .replace(/\D/g, "")
  );

  @ViewChild(Content) Content;

  constructor(
    public navCtrl: NavController,
    public menuCtrl: MenuController,
    public navParams: NavParams,
    public main: MainProvider,
    public gps: LocationTracker,
    public event: Events,
    public plt: Platform,
    public modalCtrl: ModalController
  ) {
    var data = this.navParams.get("activity");
    this.first = this.navParams.get("first");
    this.public = this.navParams.get("public");
    this.menuCtrl.enable(false);
    this.loaderHide = false;
    this.event.subscribe("noInternet:change", userData => {
      if (userData == true) {
        this.loaderHide = true;
      }
    });
    this.main.lStorageget("user").then(v => {
      this.user = v[0];
    });
    this.id = data[0];
    this.event.publish("activityId", this.id);
    this.main.getProfile().then(v => {
      this.uid = v;
    });
    this.main
      .getData("mainData/Activities/" + this.id, "", "", "", "", "")
      .then((v: any) => {
        this.loaderHide = true;
        console.log(v);
        this.activity = v;
        if (this.activity.admins[this.uid] != undefined) {
          this.admin = true;
        } else {
          this.admin = false;
        }

        if (this.activity.invited != undefined) {
          for (let i in this.activity.invited) {
            this.invited.push(this.activity.invited[i]);
            this.total.push(this.activity.invited[i]);
            if (this.activity.invited[i].key == this.uid) {
              this.state = "invited";
            }
          }
        }
        if (this.activity.cantJoin != undefined) {
          for (let i in this.activity.cantJoin) {
            this.cantJoin.push(this.activity.cantJoin[i]);
            this.total.push(this.activity.cantJoin[i]);
            if (this.activity.cantJoin[i].key == this.uid) {
              this.state = "cantJoin";
            }
          }
        }
        if (this.activity.joined != undefined) {
          for (let i in this.activity.joined) {
            this.joined.push(this.activity.joined[i]);
            this.total.push(this.activity.joined[i]);
            this.joinNo++;
            if (this.activity.joined[i].key === this.uid) {
              this.state = "joined";
            }
          }
        }
        if (!this.state) {
          this.state = "cantJoin";
        }
        if (this.invited.length > 4) {
          this.invitedView = this.invited.slice(0, 3);
          this.invitedMore = true;
        } else {
          this.invitedView = this.invited;
          this.invitedMore = false;
        }
        if (this.joined.length > 4) {
          this.joinedView = this.joined.slice(0, 3);
          this.joinedMore = true;
        } else {
          this.joinedView = this.joined;
          this.joinedMore = false;
        }
        if (this.cantJoin.length > 4) {
          this.cantJoinView = this.cantJoin.slice(0, 3);
          this.noJoinMore = true;
        } else {
          this.cantJoinView = this.cantJoin;
          this.noJoinMore = false;
        }
        console.log(this.state, this.activity.joined);
        var date1 = new Date(this.activity.time.day);
        var date2 = new Date(
          new Date(Date.now() - tzoffset).toISOString().slice(0, 10)
        );
        var timeDiff = Math.abs(date2.getTime() - date1.getTime());
        var diffDays = Math.ceil(timeDiff / (1000 * 3600 * 24));
        var hour;
        var daySplit = this.activity.time.day.split("-");
        var eventHours = this.activity.time.time;
        eventHours = eventHours.split(":");
        if (this.activity.time.ampm == "am" && eventHours[0] == "12") {
          hour = 0;
        } else if (this.activity.time.ampm == "am") {
          hour = parseInt(this.activity.time.time);
        }
        if (this.activity.time.ampm == "pm" && eventHours[0] == "12") {
          hour = 12;
        } else if (this.activity.time.ampm == "pm") {
          hour = parseInt(this.activity.time.time) + 12;
        }
        if (hour > 9) {
          this.activity.time.timestamp =
            daySplit[0].toString() +
            daySplit[1] +
            daySplit[2] +
            hour +
            eventHours[1];
        } else {
          this.activity.time.timestamp =
            daySplit[0].toString() +
            daySplit[1] +
            daySplit[2] +
            "0" +
            hour +
            eventHours[1];
        }
        if (
          parseInt(this.activity.time.timestamp) + 7640 <
            this.today + 200 + 7640 &&
          parseInt(this.activity.time.timestamp) + 7640 >
            this.today - 200 + 7640
        ) {
          this.eventIsNow = true;
        }

        if (diffDays == 0) {
          this.activity.time.date = "Today";
        } else if (diffDays == 1) {
          this.activity.time.date = "Tomorrow";
        } else {
          this.activity.time.date = this.activity.time.day2;
        }
      })
      .then(() => {
        if (this.eventIsNow == true) {
          this.gps.getNear(
            40,
            this.arrived,
            this.away,
            "",
            "",
            "",
            "",
            "",
            "",
            "",
            "",
            "",
            "",
            this.activity.place.location,
            this.total,
            "",
            "",
            ""
          );
          this.event.subscribe("nearby:done", data => {
            if (this.arrived.length > 4) {
              this.arrivedView = this.arrived.slice(0, 3);
              this.arrivedMore = true;
            } else {
              this.arrivedView = this.arrived;
              this.arrivedMore = false;
            }
            if (this.away.length > 4) {
              this.awayView = this.away.slice(0, 3);
              this.awayMore = true;
            } else {
              this.awayView = this.away;
              this.awayMore = false;
            }
          });
        }
      });
  }

  ionViewDidLoad() {
    this.main.getDataON(
      "/mainData/Chat/" + this.id,
      this.newChatMessage,
      "activity",
      1,
      "",
      this.id
    );
    this.event.subscribe("chatBack:change", data => {
      this.main.getDataON(
        "/mainData/Chat/" + this.id,
        this.newChatMessage,
        "activity",
        1,
        "",
        this.id
      );
    });
    this.event.subscribe("newChatMessage:change", data => {
      this.newChatMessage = data;
    });
    setTimeout(() => {
      this.event.subscribe("popup2:false", () => {
        this.profileModal.dismiss();
      });
      if (this.first == true) {
        this.main.viewMassageOneValue(
          "You have now invited " +
            this.invited.length +
            " people to join for " +
            this.activity.interest.name,
          ""
        );
      }
    }, 1200);
  }
  editActivityTime() {
    this.navCtrl.push(EventPage, { edit: this.activity });
  }
  editActivityPlace() {
    this.navCtrl.push(PlacePage, { edit: this.activity });
  }
  openPage(x) {
    if (x === "activities") {
      this.main.stopListen("/mainData/Chat/" + this.id);
      this.menuCtrl.enable(true);
      this.navCtrl.pop();
    } else if (x === "chat") {
      this.newChatMessage = false;
      if (this.activity.chat == undefined) {
        this.activity.chat = [];
      }
      this.navCtrl.push(ChatPage, {
        message: [
          this.activity.interest,
          this.id,
          this.total,
          this.activity.place
        ]
      });
    }
  }

  viewMore(x) {
    if (x == "away") {
      this.awayView = this.away;
      this.awayMore = false;
    }
    if (x == "arrived") {
      this.arrivedView = this.arrived;
      this.arrivedMore = false;
    }
    if (x == "joined") {
      this.joinedView = this.joined;
      this.joinedMore = false;
    }
    if (x == "nojoin") {
      this.cantJoinView = this.cantJoin;
      this.noJoinMore = false;
    }
    if (x == "invited") {
      this.invitedView = this.invited;
      this.invitedMore = false;
    }
  }
  // =================================================================================================
  // form swiching
  pressEvent(x, y) {
    this.main
      .getData("/users/" + y.key, null, null, null, null, null)
      .then(v => {
        this.pan = 0;
        this.profileModal = this.modalCtrl.create(
          ProfilePopupPage,
          { data: v, id: y.key, activity: this.activity.id, admin: this.admin },
          { cssClass: "profileContent" }
        );
        this.profileModal.present();
      });
  }
  openProfile(person){
    this.main
    .getData("/users/" + person.key, null, null, null, null, null)
    .then(v => {
      this.pan = 0;
      this.profileModal = this.modalCtrl.create(
        ProfilePopupPage,
        { data: v, id: person.key, activity: this.activity.id, admin: this.admin },
        { cssClass: "profileContent" }
      );
      this.profileModal.present();
    });
  }
  touchend() {
    if (this.pan < 5) {
      this.profileModal.dismiss();
    } else {
      this.event.publish("popup2:true");
    }
  }

  panEvent(e) {
    this.pan++;
  }

  showlist() {
    if (this.listKey == "See All") {
      this.showDetails = true;
      this.listKey = "Hide";
      setTimeout(() => {
        this.Content.scrollToBottom(500);
      }, 0);
    } else if (this.listKey == "Hide") {
      this.showDetails = false;
      this.listKey = "See All";
      setTimeout(() => {
        this.Content.scrollToTop(0);
      }, 0);
    }
  }

  // ===============================================================================================
  // change state
  changeState(x) {
    if (!this.activity.type) {
      if (x == "join" && this.state == "invited") {
        if (
          this.joinNo < this.activity.attendLimits.max ||
          this.activity.attendLimits.max == "Any"
        ) {
          this.state = "joined";
          this.main.increase("/users/" + this.uid + "/profile/0/joinNo");
          this.joinNo++;
          for (var i = 0; i < this.invited.length; i++) {
            if (this.invited[i].key == this.uid) {
              this.joined.push(this.invited[i]);
              this.invited.splice(i, 1);
            }
          }
          this.main.setData(
            "users/" + this.uid + "/activity/" + this.id + "/state/",
            "joined"
          );
          this.main.moveFbRecord(
            "/mainData/Activities/" + this.id + "/invited/" + this.uid,
            "/mainData/Activities/" + this.id + "/joined/" + this.uid
          );
        } else {
          this.main.viewMassageOneValue(
            "Sorry this activity reach its maximum limit",
            ""
          );
        }
      } else if (x == "unjoin" && this.state == "invited") {
        this.main
          .viewMassageTwoValues(
            `<p>If you unjoin this activity, it will be removed from your activities.</p>`,
            "Are you sure?"
          )
          .then((v: any) => {
            if (v == "yes") {
              this.state = "cantJoin";
              for (var i = 0; i < this.invited.length; i++) {
                if (this.invited[i].key == this.uid) {
                  this.cantJoin.push(this.invited[i]);
                  this.invited.splice(i, 1);
                }
              }
              // this.main.setData("users/"+this.uid+"/activity/"+this.id+"/state/","cantJoin");
              this.main.deleteData(
                "users/" + this.uid + "/activity/" + this.id
              );
              this.main.moveFbRecord(
                "/mainData/Activities/" + this.id + "/invited/" + this.uid,
                "/mainData/Activities/" + this.id + "/cantJoin/" + this.uid
              );
              this.navCtrl.pop();
              this.event.publish("unjoin:done", "");
            } else if (v == "no") {
            }
          });
      } else if (x == "join" && this.state == "cantJoin") {
        if (
          this.joinNo < this.activity.attendLimits.max ||
          this.activity.attendLimits.max == "Any"
        ) {
          this.state = "joined";
          this.main.increase("/users/" + this.uid + "/profile/0/joinNo");
          this.joinNo++;
          for (var i = 0; i < this.cantJoin.length; i++) {
            if (this.cantJoin[i].key == this.uid) {
              this.joined.push(this.cantJoin[i]);
              this.cantJoin.splice(i, 1);
            }
          }
          this.main.setData(
            "users/" + this.uid + "/activity/" + this.id + "/state/",
            "joined"
          );
          this.main.moveFbRecord(
            "/mainData/Activities/" + this.id + "/cantJoin/" + this.uid,
            "/mainData/Activities/" + this.id + "/joined/" + this.uid
          );
        } else {
          this.main.viewMassageOneValue(
            "Sorry this activity reach its maximum limit",
            ""
          );
        }
      } else if (x == "unjoin" && this.state == "joined") {
        this.main
          .viewMassageTwoValues(
            `<p>If you unjoin this activity, it will be removed from your activities.</p>`,
            "Are you sure?"
          )
          .then((v: any) => {
            if (v == "yes") {
              this.state = "cantJoin";
              this.main.decrease("/users/" + this.uid + "/profile/0/joinNo");
              this.joinNo--;
              for (var i = 0; i < this.joined.length; i++) {
                if (this.joined[i].key == this.uid) {
                  this.cantJoin.push(this.joined[i]);
                  this.joined.splice(i, 1);
                }
              }
              // this.main.setData("users/"+this.uid+"/activity/"+this.id+"/state/","cantJoin");
              this.main.deleteData(
                "users/" + this.uid + "/activity/" + this.id
              );
              this.main.moveFbRecord(
                "/mainData/Activities/" + this.id + "/joined/" + this.uid,
                "/mainData/Activities/" + this.id + "/cantJoin/" + this.uid
              );
              this.navCtrl.pop();
              this.event.publish("unjoin:done", "");
            } else if (v == "no") {
            }
          });
      }
    } else {
      if (x == "join") {
        if (
          this.joinNo < this.activity.attendLimits.max ||
          this.activity.attendLimits.max == "Any"
        ) {
          this.state = "joined";
          this.main.increase("/users/" + this.uid + "/profile/0/joinNo");
          this.joinNo++;
          let m: any;
          m = { profile: this.user, key: this.uid };
          m.profile[0] = { name: this.user.name, profile: this.user.profile };
          this.main.setData("/mainData/Activities/" + this.id + "/joined/" + this.uid,m );
        } else {
          this.main.viewMassageOneValue(
            "Sorry this activity reach its maximum limit",
            ""
          );
        }
      } else {
        this.state = "cantJoin";
        this.main.decrease("/users/" + this.uid + "/profile/0/joinNo");
        this.joinNo--;
        this.main
          .deleteData("/mainData/Activities/" + this.id + "/joined/" + this.uid);      }
    }
  }

  openTasks() {
    this.navCtrl.push(ActivityTasksPage, { id: [this.id] });
  }
  //{ data: v, id: person.key, activity: this.activity.id, admin: this.admin },

  addAsAdmin(one){
    this.main.setData("/mainData/Activities/"+this.activity.id+"/admins/"+one.key+"/",one).then(()=>{
      this.activity.admins[one.key]=one;
    })

  }
}
