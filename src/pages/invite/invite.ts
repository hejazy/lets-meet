import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, Events, Platform } from 'ionic-angular';
import { MainProvider } from '../../providers/main/main';
import { HomePage } from '../home/home';
import { Contacts } from '@ionic-native/contacts';
import { InAppBrowser } from '@ionic-native/in-app-browser';
import { DomSanitizer } from '@angular/platform-browser';
// import { Facebook } from '@ionic-native/facebook';
import { SMS } from '@ionic-native/sms';
import { EmailComposer } from '@ionic-native/email-composer';
import { SocialSharing } from '@ionic-native/social-sharing';


@IonicPage()
@Component({
  selector: 'page-invite',
  templateUrl: 'invite.html',
})
export class InvitePage {
  public loaderHide: boolean = true;
  public people: any = [];
  public total: any = [];
  public uid: string;
  public currentPageClass = this;
  public viewAlpha: boolean = false;
  public searchValue: any = "";
  public alphabet: string;
  public divHeight: number;
  public appHeight: number;
  public thistab: number = 1;
  public friendlist: any = [];
  public keyboardhide: boolean = false;
  public system: any;
  public user: any;
  private emailsUsers: any;
  private smsUsers: any;
  public alphaScrollItemTemplate: string = `

`;

  constructor(public navCtrl: NavController, public navParams: NavParams, public contacts: Contacts, public main: MainProvider,
    public sanitizer: DomSanitizer, public iab: InAppBrowser
    // , public fb: Facebook
    , public sms: SMS, public emailComposer: EmailComposer, public plt: Platform, private socialSharing: SocialSharing) {
    var application = <HTMLElement>(document.getElementsByTagName('ION-APP')[0]), appHeight = application.clientHeight;
    this.appHeight = ((appHeight - 145) / 2) + 145;
    window.addEventListener('native.keyboardshow', (e) => { this.keyboardhide = true });
    window.addEventListener('native.keyboardhide', () => { this.keyboardhide = false });
    if (this.plt.is('ios')) { this.system = 'ios' }
    else if (this.plt.is('android')) { this.system = 'android' }
    this.main.lStorageget("user").then((v)=>{
      this.user=v[0];
    })
  }

  ionViewDidLoad() {
    this.loaderHide = false;
    var uploadedData = [];
    var opts = { filter: "", multiple: true, hasPhoneNumber: true, fields: ['displayName', 'name'] };
    this.contacts.find(['displayName', 'name'], opts).then((contacts) => { this.people = contacts; },
      (error) => { this.loaderHide = true; }).then(() => {
        for (var i in this.people) {
          if (this.people[i]._objectInstance.name != null) {
            if (this.people[i]._objectInstance.phoneNumbers != null) {
              for (var j = 0; j < this.people[i]._objectInstance.phoneNumbers.length; j++) {
                this.people[i]._objectInstance.phoneNumbers[j].value = this.people[i]._objectInstance.phoneNumbers[j].value.replace(/[^\d]/g, '');
                uploadedData.push(this.people[i]._objectInstance.phoneNumbers[j].value)
              }
            }
            if (this.people[i]._objectInstance.emails != null) {
              for (j = 0; j < this.people[i]._objectInstance.emails.length; j++) {
                uploadedData.push(this.people[i]._objectInstance.emails[j].value)
              }
            }
            if (this.people[i]._objectInstance.name.formatted != (undefined || null)) {
              var char = this.people[i]._objectInstance.name.formatted.charAt(0);
              this.people[i]._objectInstance.char = char;
              if (this.people[i]._objectInstance.photos != undefined) {
                this.people[i]._objectInstance.photos[0].value = this.sanitizer.bypassSecurityTrustUrl(this.people[i]._objectInstance.photos[0].value)
              }
            } else { this.people.splice(i, 1) }
          }
          else { this.people.splice(i, 1) }
        }
      }).then(() => {
        this.main.lStorageget("uid").then((v: any) => {
          this.uid = v;
          this.main.setData("/users/" + this.uid + "/friends/", uploadedData);
        })
        this.people.sort((a, b) => {
          if (a._objectInstance.name.formatted > b._objectInstance.name.formatted) return 1;
          if (a._objectInstance.name.formatted < b._objectInstance.name.formatted) return -1;
          return 0;
        })
      }).then(() => {
        var k;
        this.main.getData('/users/' + this.uid + "/sfriends/", null, null, null, null, null).then((v: any) => {
          for (var a in v) { if (v[a].key != this.uid) { v[a].key = a; this.friendlist.push(v[a]) } };
          var m = this.friendlist;
          for (var i = 0; i < m.length; i++) {
            for (var j in this.people) {
              if (this.people[j]._objectInstance.phoneNumbers != null) {
                for (k = 0; k < this.people[j]._objectInstance.phoneNumbers.length; k++) {
                  if (this.people[j]._objectInstance.phoneNumbers[k].value.replace(/[^\d]/g, '') == m[i].phone) { this.people.splice(j, 1) }
                }
              }
              if (this.people[j]._objectInstance.emails != null) {
                for (k = 0; k < this.people[j]._objectInstance.emails.length; k++) {
                  if (this.people[j]._objectInstance.emails[k].value.replace(/[^\d]/g, '') == m[i].email) { this.people.splice(j, 1) }
                }
              }
            }
          }
          // console.log(this.friendlist)
        }).then(() => {
          var x = this.people;
          this.smsUsers = x.filter(function (item) {
            return (item._objectInstance.phoneNumbers != undefined);
          });
          this.emailsUsers = x.filter(function (item) {
            return (item._objectInstance.emails != undefined);
          });
          this.total = this.emailsUsers;
          setTimeout(()=>{
            this.loaderHide = true;
            this.search({ target: { value: this.searchValue } })
          },200);

        })
      })
  }
  // =============================================================================================================================================
  // open sms  of emails
  openPage() {
    if (this.thistab == 1) {
      var phoneList = [];
      var i;
      for (i = 0; i < this.total.length; i++) {
        if (this.total[i].check == true) {
          phoneList.push(this.total[i]._objectInstance.phoneNumbers[0].value);
        }
      }
      this.sms.send(phoneList, `Mate download join so we can discover the city & live groovy with others, using this code and join us: ` + this.user.code+`
      Play Store :
      App Store :  `, { replaceLineBreaks: true, android: { intent: "INTENT" } })
    }
    else if (this.thistab == 2) {
      var emailList = [];
      for (i = 0; i < this.total.length; i++) {
        if (this.total[i].check == true) {
          emailList.push(this.total[i]._objectInstance.emails[0].value);
        }
      }
      let email = {
        to: emailList, subject: 'Join Invitation', isHtml: true,
        body: `<p>Mate download join so we can discover the city & live groovy with others, using this code and join us : ` + this.user.code+`</p> <p>Play Store : </p><p>App Store : </p>`
      };
      this.emailComposer.open(email);
    }
  }


  share() {
    this.socialSharing.share("Mate download lets meet so we can discover the city & live groovy with others, using this code and join us: " + this.user.code, "Join invitation", "", "").then(() => {
      console.log("shareSheetShare: Success");
    }).catch((e) => {
      console.log(e);
    });
  }
  // =============================================================================================================================================
  // test code
  // clickAlpha(x,y){
  // this.viewAlpha=true;
  // this.alphabet=x;
  // this.divHeight = y - (20*((y-this.appHeight)/this.appHeight));
  // }
  // ====================================================================================================================================================
  // test code
  // touchend(){
  // setTimeout(()=>{  this.viewAlpha=false;},60);
  // }
  // =============================================================================================================================================
  // send invitation usign whatsapp or facebook
  clickEvent(x, y) {
    if (y == "whatsapp") {
      this.iab.create("whatsapp://send?text=Mate%2C%20download%lets%20meet%20so%20we%20can%20discover%20the%20city%20%26%20live%20groovy%20with%20others%2E%0APlay%20store%20   %0AApp%20store%20    ", "_system", "location=true");
    }
    else {
      if (y.check == true) { y.check = false; }
      else { y.check = true }
    }
  }
  // ================================================================================================
  // change taps
  changeForm(x) {
    if (x == 1) {
    this.thistab = 2;
      this.search({ target: { value: this.searchValue } })
    }
    else {
    this.thistab = 1;
      this.search({ target: { value: this.searchValue } })
    }
  }

  // =============================================================================================================================================
  // search contacts
  search(ev: any) {
    if (this.thistab == 1) {
      this.total = this.smsUsers;;
      var val = ev.target.value;
      this.total = this.total.filter(function (item) {
        return (item._objectInstance.name.formatted.toLowerCase().indexOf(val.toLowerCase()) > -1);
      })
    }
    if (this.thistab == 2) {
      this.total = this.emailsUsers;
      var val = ev.target.value;
      this.total = this.total.filter(function (item) {
        return (item._objectInstance.name.formatted.toLowerCase().indexOf(val.toLowerCase()) > -1);
      })
    }
  }

}
