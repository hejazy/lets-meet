import { Component, ViewChild } from "@angular/core";
import {
  IonicPage,
  NavController,
  NavParams,
  Events,
  ActionSheetController
} from "ionic-angular";
import { Md5 } from "ts-md5/dist/md5";
import { MainProvider } from "../../providers/main/main";
import { MenuController } from "ionic-angular";
import { HomePage } from "../home/home";
import { FirebaseProvider } from "angular-firebase";
import {DomSanitizer} from '@angular/platform-browser';

var tzoffset = new Date().getTimezoneOffset() * 60000;
@IonicPage()
@Component({
  selector: "page-signup",
  templateUrl: "signup.html"
})
export class SignupPage {
  public uid: string;
  public captureDataUrl: any = "";
  public autho: boolean = false;
  public loaderHide: boolean = true;
  public input: any = [];
  public user: any = [];
  public mailKey: string;
  public interval: any;
  public default: any = "";
  public genderr: any = "";
  public activity: any = "";
  public clock;
  public day;
  public invited: any = "";

  @ViewChild("a1") a1;
  @ViewChild("a2") a2;
  @ViewChild("a3") a3;
  @ViewChild("a4") a4;
  @ViewChild("a5") a5;
  @ViewChild("a6") a6;
  @ViewChild("a7") a7;
  @ViewChild("a8") a8;
  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public main: MainProvider,
    public events: Events,
    public actionSheetCtrl: ActionSheetController,
    public menuCtrl: MenuController,
    public _DomSanitizer: DomSanitizer,
    public fb:FirebaseProvider
  ) {
    // this.activity=this.navParams.get('activity');
    // this.invited=this.navParams.get('invited');
  }

  ionViewDidLoad() {
    setTimeout(() => {
      this.a1.setFocus();
    }, 300);
    // if(this.activity==undefined){this.activity=""}
    // if(this.invited==undefined){this.invited=""}
  }
  // ==========================================================================================================
  // input functions

  next(x, y) {
    //go to next input when press enter  inputs:key no & the input id
    this.input = {
      a1: this.a1,
      a2: this.a2,
      a3: this.a3,
      a4: this.a4,
      a5: this.a5,
      a6: this.a6,
      a7: this.a7,
      a8: this.a8
    };
    if (x == 13 && y != "a5") {
      var z = y.charAt(1);
      var c = y.charAt(0);
      z = parseInt(z) + 1;
      y = c + z;
      this.input[y].setFocus();
    } else if (x == 13 && y == "a5") {
      this.a6.open();
    }
  }

  end(a, b, e, f, g, h, i) {
    if (a == 13) {
      this.signup(a, b, e, f, h, i);
    }
  }

  // ======================================================================================================================
  // forms changing   input:current form
  // changeForm(){this.navCtrl.pop(SigninPage,{activity:this.activity});}

  // ====================================================================================================================
  // signup function        input: user name & birth day & email & password & confirmation password

  signup(a, j, c, d, h, i) {
    var g = this.genderr;
    if (a && c && d && g && h && j) {
      if (h == i && h.length > 7) {
        this.loaderHide = false;
        this.main
          .getData1("/sharedData/usersLists/", "uniquName", j)
          .then(uniquName => {
            if (uniquName == null || uniquName == undefined) {
              var pass = Md5.hashStr(h);
              // this.main.lStorageset("interestsdone", false);
              this.main.signupMial(c, h).then((value:any) => {
                if (typeof(value) ==="object") {
                  this.main.getProfile().then((v: string) => {
                    this.uid = v;
                    this.main.lStorageset("uid", this.uid);
                    if (!this.captureDataUrl) {
                      var x =document.getElementById('image');
                      this.captureDataUrl = this.getBase64Image(x);
                    }
                    this.fb.uploadString(this.captureDataUrl, "images/users/" + this.uid + "Profile.jpg", 'base64').then((url: string) => {
                        this.user = [
                          {
                            name: a,
                            birth: "",
                            pass: pass,
                            email: c,
                            phone: d,
                            joinNo: 0,
                            profile: url,
                            verify: false,
                            gender: g,
                            uniqueName: j,
                            available: "all",
                            course: "",
                            university: "",
                            notification: true,
                            location: true
                          }
                        ];
                        this.events.publish("username:changed", this.user);
                        this.main.lStorageset("user", this.user).then(() => {
                          this.main.verificationMail();
                          var newtext = c.replace("@", "");
                          this.mailKey = newtext.replace(".", "");
                          this.main.setData(
                            "/users/" + this.uid + "/profile/",
                            this.user
                          );
                          this.main.lStorageset("authType", "email");
                          this.main.setData(
                            "/sharedData/usersLists/" + this.uid,
                            {
                              email: c,
                              phone: d.replace(/[^\d]/g, ""),
                              name: a,
                              profile: v,
                              uniqueName: j
                            }
                          );
                          this.main.lStorageset("autho", true);
                          this.main.lStorageset("mailkey", this.mailKey);
                          this.loaderHide = true;
                          this.main.setData(
                            "mainData/Activities/" +
                              this.invited +
                              "/invited/" +
                              this.uid,
                            {
                              key: this.uid,
                              profile: [
                                {
                                  name: this.user[0].name,
                                  profile: this.user[0].profile
                                }
                              ]
                            }
                          );
                          this.navCtrl.setRoot(HomePage);
                          //this.navCtrl.push(ActivitiesPage);
                          //this.navCtrl.push(ActivityPage, { activity: [this.invited, "invited"] });
                          this.main.viewMassageOneValue(
                            `<p>A verification email has been sent to your inbox.</p><br><p>Please verify your email whenever you're bored :)</p>`,
                            ""
                          );
                        }); //show check inbox message
                      }).catch(err=>{
                        console.log(err)
                      });
                  });
                } else {
                  var x = "Error";
                  if (
                    value ==
                    "The email address is already in use by another account."
                  ) {
                    x = "";
                    value = `<p>Error: address already in use.</p><br><p>Give it another try.</p>`;
                  }
                  if (value == "The email address is badly formatted.") {
                    value = "Check your email address.";
                  }
                  this.main.viewMassageOneValue(value, x); //show error message
                  this.loaderHide = true;
                }
              });
            } else {
              this.main.viewMassageOneValue(
                `<p>This name taken, Please enter another unique name.</p>`,
                ""
              );
              this.loaderHide = true;
            }
          });
      } else {
        this.main.viewMassageOneValue(
          `<p>Password don't match or are less than 8 characters.</p><br><p>You'r sober.You can do this.</p>`,
          ""
        ); //show error message
      }
    } else {
      this.main.viewMassageOneValue(
        `<p>Please fill out all fields to match you better with people.</p><br><p>You'r sober.You can do this.</p>`,
        ""
      );
    } //show error message
  }

  // ===============================================================================================================
  // upload image

  uploadImage() {
    let alert = this.actionSheetCtrl.create({
      title: "Pick image from",
      buttons: [
        {
          text: "Camera",
          handler: () => {
            this.main.cameraCap().then((v: any) => {
              this.captureDataUrl = v;
            });
          }
        },
        {
          text: "Gallery",
          handler: () => {
            this.main.gallery().then((v: any) => {
              this.captureDataUrl = v;
            });
          }
        }
      ]
    });
    alert.present();
  }

  time1() {
    var h;
    var hm;
    h = new Date().getHours();
    hm = new Date().getMinutes();
    var ampm = h >= 12 ? " PM" : "AM";
    h = h % 12;
    if (h === 0) {
      h = 12;
    }
    if (hm > 10) {
      this.clock = h + ":" + hm + ampm;
    }
    if (hm <= 10) {
      this.clock = h + ":" + "0" + hm + ampm;
    }
    this.day = new Date(Date.now() - tzoffset).toISOString().slice(0, 10);
  }

getBase64Image(img) {
  var canvas = document.createElement("canvas");
  canvas.width = img.width;
  canvas.height = img.height;
  var ctx = canvas.getContext("2d");
  ctx.drawImage(img, 0, 0);
  var dataURL = canvas.toDataURL("image/png");
  return dataURL.replace(/^data:image\/(png|jpg);base64,/, "");
}
}
