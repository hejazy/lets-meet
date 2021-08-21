import { BrowserModule } from '@angular/platform-browser';
import { ErrorHandler, NgModule } from '@angular/core';
import { MyApp } from './app.component';
import { IonicApp, IonicErrorHandler, IonicModule } from 'ionic-angular';
import { SplashScreen } from '@ionic-native/splash-screen';
import { StatusBar } from '@ionic-native/status-bar';
// ionic native
import {FirebaseModule, FirebaseProvider} from 'angular-firebase'

import { IonicStorageModule } from '@ionic/storage';
import { Contacts } from '@ionic-native/contacts';
import { OneSignal } from '@ionic-native/onesignal';
import { Network } from '@ionic-native/network';
import { Geolocation } from '@ionic-native/geolocation';
import { LaunchNavigator } from '@ionic-native/launch-navigator';
import { Camera  } from '@ionic-native/camera';
import { Diagnostic } from '@ionic-native/diagnostic';
import { MultiPickerModule } from 'ion-multi-picker';
import { LocalNotifications } from '@ionic-native/local-notifications';
import { InAppBrowser } from '@ionic-native/in-app-browser';
import { IonAlphaScrollModule } from 'ionic2-alpha-scroll';
import { SMS } from '@ionic-native/sms';
import { EmailComposer } from '@ionic-native/email-composer';
import { NativeAudio } from '@ionic-native/native-audio';
import { ElasticModule } from 'ng-elastic';
import { BackgroundMode } from '@ionic-native/background-mode';
import { FilePath } from '@ionic-native/file-path';
import { File } from '@ionic-native/file';
import { FileChooser } from '@ionic-native/file-chooser';
import { FileTransfer } from '@ionic-native/file-transfer';


// pages
import { ActivitiesTabsPage } from './../pages/activities-tabs/activities-tabs';
import { OpenPage } from '../pages/open/open';
import { WelcomePage } from '../pages/welcome/welcome';
import { SigninPage } from '../pages/signin/signin';
import { SignupPage } from '../pages/signup/signup';
import { ForgetPage } from '../pages/forget/forget';
import { HomePage } from '../pages/home/home';
import { PlacePage } from '../pages/place/place';
import { EventPage } from '../pages/event/event';
import { WhoPage } from '../pages/who/who';
import { ActivityPage } from '../pages/activity/activity';
import { ActivitiesPage } from '../pages/activities/activities';
import { InterestPage } from '../pages/interest/interest';
import { SearchPage } from '../pages/search/search';
import { SocialSharing } from '@ionic-native/social-sharing';
import { InvitePage } from '../pages/invite/invite';
import { ChatPage } from '../pages/chat/chat';
import { ProfilePage } from '../pages/profile/profile';
import { NotificationPage } from '../pages/notification/notification';
import { ProfilePopupPage } from '../pages/profile-popup/profile-popup';
import { ActivityTasksPage } from '../pages/activity-tasks/activity-tasks';
import { ActivityTaskPopupPage } from '../pages/activity-task-popup/activity-task-popup';
import { PublicActivitiesPage } from '../pages/public-activities/public-activities';
import { InviteFriendsPage } from './../pages/invite-friends/invite-friends';

// providers
import { MainProvider } from '../providers/main/main';
import { LocationTracker } from '../providers/gps/location-tracker';

@NgModule({
  declarations: [
    MyApp,
    HomePage,
    OpenPage,
    SigninPage,
    SignupPage,
    EventPage,
    PlacePage,
    ActivitiesTabsPage,
    PublicActivitiesPage,
    WhoPage,
    WelcomePage,
    InvitePage,
    ProfilePage,
    ActivityTaskPopupPage,
    InviteFriendsPage,
    InterestPage,
    ActivityPage,
    NotificationPage,
    ActivitiesPage,
    ProfilePopupPage,
    ChatPage,
    ForgetPage,
    SearchPage,
    ActivityTasksPage
  ],
  imports: [
    BrowserModule,
    IonicStorageModule.forRoot(),
    MultiPickerModule ,
    ElasticModule,
    IonAlphaScrollModule,
    FirebaseModule,
    IonicModule.forRoot(MyApp,{tabsPlacement: 'top'}),

  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    HomePage,
    OpenPage,
    SigninPage,
    SignupPage,
    EventPage,
    PlacePage,
    WelcomePage,
    WhoPage,
    ActivityTaskPopupPage,
    ActivitiesTabsPage,
    InviteFriendsPage,
    // SignupfPage,
    PublicActivitiesPage,
    InvitePage,
    ActivityPage,
    ProfilePage,
    InterestPage,
    ProfilePopupPage,
    NotificationPage,
    ActivitiesPage,
    ChatPage,
    ForgetPage,
    SearchPage,
    ActivityTasksPage
  ],
  providers: [
    FirebaseProvider,
    OneSignal,
    Camera,
    Network,
    Geolocation,
    NativeAudio,
    LocalNotifications,
    BackgroundMode,
    Diagnostic,
    LaunchNavigator,
    Contacts,
    // Facebook,
    InAppBrowser,
    StatusBar,
    SplashScreen,
    SMS,
    EmailComposer,
    {provide: ErrorHandler, useClass: IonicErrorHandler},
    MainProvider,
    LocationTracker,
    FilePath,
    File,
    FileChooser,
    FileTransfer,
    SocialSharing,
  ]
})
export class AppModule {}
