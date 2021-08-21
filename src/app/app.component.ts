import { InviteFriendsPage } from "./../pages/invite-friends/invite-friends";
import { Component, ViewChild } from "@angular/core";
import { Platform, Nav, Events, Content, MenuController } from "ionic-angular";
import { StatusBar } from "@ionic-native/status-bar";
import { SplashScreen } from "@ionic-native/splash-screen";
import firebase from "firebase";
import { OneSignal,OSNotificationPayload } from "@ionic-native/onesignal";
import { BackgroundMode } from "@ionic-native/background-mode";

import { ActivitiesTabsPage } from "./../pages/activities-tabs/activities-tabs";
import { HomePage } from "../pages/home/home";
import { OpenPage } from "../pages/open/open";
import { ActivityPage } from "../pages/activity/activity";
import { ProfilePage } from "../pages/profile/profile";
import { SigninPage } from "../pages/signin/signin";
import { MainProvider } from "../providers/main/main";
import { LocationTracker } from "../providers/gps/location-tracker";
import { NotificationPage } from "../pages/notification/notification";

@Component({
  templateUrl: "app.html"
})
export class MyApp {
  rootPage: any = OpenPage;
  public pages: any = [];
  public user: any = [];
  public uid: any = "";
  public notification: boolean = false;
  public ioschange: string = "androidmode";
  public popup: boolean = false;
  public popup2: boolean = false;
  public id: any;
  public disableNotification: boolean = false;
  public disableProfile: boolean = false;
  private onPushReceived(payload: OSNotificationPayload) {
    alert('Push recevied:' + payload.body);
  }

  private onPushOpened(payload: OSNotificationPayload) {
    alert('Push opened: ' + payload.body);
  }

  @ViewChild(Nav) nav: Nav;

  constructor(
    platform: Platform,
    statusBar: StatusBar,
    public menuCtrl: MenuController,
    public main: MainProvider,
    public events: Events,
    public gps: LocationTracker,
    public backgroundMode: BackgroundMode,
    private oneSignal: OneSignal
  ) {
    const oneSignalAppId = "67379eb9-102f-4eb7-bfe2-302abfa48cc7";
    const sender_id = "738115486833";
    this.main.lStorageget("user").then(v => {
      if (v != undefined || v != null) {
        this.user = v;
      }
    });
    this.main.lStorageget("uid").then(v => {
      this.uid = v;
      if (this.uid != undefined) {
        this.gps.start("");
        this.main.getDataONnotification(
          "/users/" + this.uid + "/notification/",
          25
        );
      }
    });
    this.events.subscribe("uid:changed", userData => {
      this.uid = userData;
      this.main.getDataONnotification(
        "/users/" + this.uid + "/notification/",
        25
      );
    });
    this.events.subscribe("username:changed", userData => {
      this.user = userData;
    });
    this.events.subscribe("activityId", data => {
      this.id = data;
    });
    this.events.subscribe("popup2:true", () => {
      this.popup2 = true;
    });
    this.events.subscribe("popup:true", () => {
      this.popup = true;
    });
    this.events.subscribe("notification:clicked", userData => {
      this.nav.push(NotificationPage).then(v => {
        this.nav.push(ActivityPage, { activity: [userData, ""] });
      });
    });
    this.events.subscribe("notificatin:new", userData => {
      this.notification = true;
    });

    var config = {
      apiKey: "AIzaSyB0x28ueBu8Id75XrBmsJJWLsQPlXaksXI",
      authDomain: "lets-meet-585ae.firebaseapp.com",
      databaseURL: "https://lets-meet-585ae.firebaseio.com",
      projectId: "lets-meet-585ae",
      storageBucket: "lets-meet-585ae.appspot.com",
      messagingSenderId: "738115486833"
    };
    firebase.initializeApp(config);
    platform.ready().then(() => {
      platform.registerBackButtonAction(() => {
        if (this.nav.getActive().index == 0) {
          this.backgroundMode.moveToBackground();
        } else if (this.popup == true) {
          this.popup = false;
          this.events.publish("popup:false");
        } else if (this.popup2 == true) {
          this.popup2 = false;
          this.events.publish("popup2:false");
        } else if (this.nav.canGoBack()) {
          if (
            this.nav.getActive().name == "PlacePage" ||
            this.nav.getActive().name == "ActivityPage"
          ) {
            this.menuCtrl.enable(true);
          }
          if (this.nav.getActive().name == "ActivityPage") {
            this.main.stopListen("/mainData/Chat/" + this.id);
          }
          if (this.nav.getActive().name == "ChatPage") {
            this.main.stopListen("/mainData/Chat/" + this.id).then(() => {
              this.events.publish("chatBack:change", "");
            });
          }
          this.nav.pop();
        }
      });
      statusBar.styleDefault();
      this.oneSignal.startInit(oneSignalAppId, sender_id);
      this.oneSignal.inFocusDisplaying(this.oneSignal.OSInFocusDisplayOption.Notification);
      this.oneSignal.handleNotificationReceived().subscribe(data => this.onPushReceived(data.payload));
      this.oneSignal.handleNotificationOpened().subscribe(data => this.onPushOpened(data.notification.payload));
      this.oneSignal.endInit();

      if (platform.is("ios")) {
        this.ioschange = "iphoneMode";
      }
    });
    this.main.connectionTest();
    setTimeout(() => {
      this.main.onesignalInit();
    }, 10000);
    this.pages = [
      {
        title: "Home",
        mainTitle: "HomePage",
        component: HomePage,
        disable: true
      },
      {
        title: "Activities",
        mainTitle: "ActivitiesTabsPage",
        component: ActivitiesTabsPage,
        disable: false
      },
      {
        title: "Add Friends",
        mainTitle: "InviteFriendsPage",
        component: InviteFriendsPage,
        disable: false
      }
    ];
    setTimeout(() => {
      this.nav.viewDidEnter.subscribe(view => {
        for (var i = 0; i < this.pages.length; i++) {
          if (this.pages[i].mainTitle == view.instance.constructor.name) {
            this.pages[i].disable = true;
            this.disableProfile = false;
            this.disableNotification = false;
          } else {
            this.pages[i].disable = false;
          }
        }
      });
    }, 800);
  }

  openPage(page) {
    if (page == "notification" && this.disableNotification != true) {
      setTimeout(() => {
        this.notification = false;
      }, 1000);
      this.nav.push(NotificationPage);
      this.disableProfile = false;
      this.disableNotification = true;
      for (var i = 0; i < this.pages.length; i++) {
        this.pages[i].disable = false;
      }
    } else if (page == "setting" && this.disableProfile != true) {
      this.nav.push(ProfilePage);
      this.disableProfile = true;
      this.disableNotification = false;
      for (let i = 0; i < this.pages.length; i++) {
        this.pages[i].disable = false;
      }
    } else if (
      page != "setting" &&
      page != "notification" &&
      page.title == "Home"
    ) {
      this.nav.setRoot(page.component);
    } else if (page != "setting" && page != "notification") {
      this.nav.push(page.component);
    }
    this.menuCtrl.close();
  }

  logout() {
    this.main.lStorageset("autho", false);
    this.main.lStorageset("user", []);
    this.main.signout();
    this.nav.setRoot(SigninPage);
    this.main.signout();
    this.menuCtrl.close();
  }
}
