import { Component } from "@angular/core";
import { IonicPage, NavController, NavParams } from "ionic-angular";
import { MenuController } from "ionic-angular";
import { MainProvider } from "../../providers/main/main";
// import { WelcomePage } from '../welcome/welcome';
import { HomePage } from "../home/home";
import { SigninPage } from "../signin/signin";
import { InterestPage } from "../interest/interest";
@IonicPage()
@Component({
  selector: "page-open",
  templateUrl: "open.html"
})
export class OpenPage {
  public autho: boolean = false;
  public welcome: boolean = false;
  public interestDone: boolean = false;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public main: MainProvider,
    public menuCtrl: MenuController
  ) {
    this.menuCtrl.enable(false);
    this.main.lStorageget("interestsdone").then((v: any) => {
      if (v != (undefined || null)) {
        this.interestDone = v;
      }
      this.main
        .lStorageget("welcome")
        .then((value: any) => {
          if (value != undefined || value != null) {
            this.welcome = value;
          }
        })
        .then(() => {
          this.main
            .lStorageget("autho")
            .then((value: any) => {
              if (value != undefined || value != null) {
                this.autho = value;
              }
            })
            .then(v => {
              //   if(this.welcome==false){
              //   this.navCtrl.setRoot(WelcomePage);
              // }
              // else{
              if (this.autho == false) {
                this.navCtrl.setRoot(SigninPage);
              } else {
                this.main.AuthState().then(v => {
                  if (v == true) {
                    this.menuCtrl.enable(true);
                    this.main.lStorageset("autho", true);
                      this.navCtrl.setRoot(HomePage);
                  } else {
                    this.main.signout();
                    this.main.lStorageset("autho", false);
                    this.navCtrl.setRoot(SigninPage);
                  }
                });
              }
              // }
            });
        });
    });
  }

  ionViewDidLoad() {}
}
