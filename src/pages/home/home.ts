import { Component } from "@angular/core";
import { NavController, NavParams, Events } from "ionic-angular";
import { Storage } from "@ionic/storage";
import { PlacePage } from "../place/place";
import { MenuController } from "ionic-angular";
import { MainProvider } from "../../providers/main/main";
import { FirebaseProvider } from "angular-firebase";

@Component({
  selector: "page-home",
  templateUrl: "home.html"
})
export class HomePage {
  public user: any = [];
  public uid: string;
  public interests: any = "";
  public other: any = [];
  public interestsF: any = "";
  public otherF: any = [];
  public firstTime: any;
  public loaderHide: boolean = false;
  public auth: boolean = false;
  public type;
  public custom;
  private s;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public storage: Storage,
    public main: MainProvider,
    public menuCtrl: MenuController,
    public event: Events,
    public fb: FirebaseProvider
  ) {
    this.main.lStorageget("autho").then((x: boolean) => {
      this.auth = x;
      if (x == true) {
        this.menuCtrl.enable(true);
        this.event.subscribe("noInternet:change", userData => {
          if (userData == true) {
            this.loaderHide = true;
          }
        });
        this.firstTime = this.navParams.get("firstTime");
        this.main
          .lStorageget("uid")
          .then((value: any) => {
            this.uid = value;
          })
          .then(() => {
            this.fb.getDataArr("/sharedData/interests/").then((v: any) => {
              this.interests = v;
              this.interestsF = v;
              this.loaderHide = true;
            });
          });
      } else {
        this.event.subscribe("noInternet:change", userData => {
          if (userData == true) {
            this.loaderHide = true;
          }
        });
        this.fb.getDataArr("/sharedData/interests/")
          .then((v: any) => {
            this.interests = v;
            this.interestsF = v;
          })
          .then(() => {
            this.fb
              .getDataArr("/sharedData/otherInterests/")
              .then((v: any) => {})
              .then(() => {
                this.loaderHide = true;
              });
          });
      }
    });
  }
  ionViewDidLoad() {
    this.custom = {
      color: "#eb9700",
      ico:
        "https://firebasestorage.googleapis.com/v0/b/ephunk-f5312.appspot.com/o/interests%2Fstar_Ico.png?alt=media&token=8761c441-eef5-4cc9-99e3-18dfb7261db9",
      img:
        "https://firebasestorage.googleapis.com/v0/b/ephunk-f5312.appspot.com/o/interests%2Fstar.jpg?alt=media&token=217d30aa-a44e-4791-9f8a-e32cb22d0135",
      imgP:
        "https://firebasestorage.googleapis.com/v0/b/ephunk-f5312.appspot.com/o/interests%2Fstar.jpg?alt=media&token=217d30aa-a44e-4791-9f8a-e32cb22d0135"
    };
    if (this.firstTime == "yes") {
      this.main.viewMassageOneValue(
        `<p>Now you can start joining.</p><p>Tap on what you want to do.</p><br><p>Also add to your intersts as you groove through life.</p>`,
        "Wicked!"
      );
    }
  }

  // =============================================================================================================================================
  // make new event
  makeNewActivity(x) {
    if (!x.name) {
      x.name = this.s;
    }
    x = { interest: x };
    this.navCtrl.push(PlacePage, { new: x });
  }

  // ======================================================================================================
  // searchbar search(ev:any){
  //#region  search
  search(ev: any) {
    var val = ev.target.value;
    return new Promise((resolve, reject) => {
      this.interestsF = this.interests.filter(function(v) {
        if (v.name.toLowerCase().indexOf(val.toLowerCase()) > -1) {
          return true;
        }
      });
      resolve("done");
    }).then(v => {
      this.otherF = this.other.filter(function(v) {
        if (v.name.toLowerCase().indexOf(val.toLowerCase()) > -1) {
          return true;
        }
      });
    });
  }
  //#endregion
}
