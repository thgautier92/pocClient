import { Component } from '@angular/core';
import { NavController, NavParams, Events, LoadingController, AlertController, ToastController } from 'ionic-angular';
import { MfpTracePage } from "./mfp-trace/mfp-trace";
import { MfpApiPage } from "./mfp-api/mfp-api";
import { MfpInfoPage } from "./mfp-info/mfp-info";
declare var WL: any;
declare var WLAuthorizationManager: any;
/*
  Generated class for the Mfp page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/
@Component({
  selector: 'page-mfp',
  templateUrl: 'mfp.html'
})
export class MfpPage {
  tab1: any;
  tab2: any;
  tab3: any;
  mfpReady: any;
  lstScript: any;
  PinCodeChallengeHandler: any;
  constructor(public navCtrl: NavController, public navParams: NavParams, public events: Events,
    public alertCtrl: AlertController,
    private toastCtrl: ToastController,
    public loadingCtrl: LoadingController) {
    this.tab1 = MfpTracePage;
    this.tab2 = MfpApiPage;
    this.tab3 = MfpInfoPage;
    this.mfpReady = { "ready": false, "connect": false };
    this.lstScript = [
      { "id": "mfpAnalyticsInit", "src": "assets/mfp/lib/analytics/ibmmfpfanalytics.js", "delay": 9000 },
      { "id": "mfpInit", "src": "assets/mfp/ibmmfpf.js", "delay": 2000 }
    ];
    this.events.subscribe("mfpJsLoaded", data => {
      setTimeout(() => {
        this.mfpInit();
      }, 3000);
    })
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad MfpPage');
  }
  ngOnInit() {
    if (typeof WL == "undefined" || typeof WL.logger == "undefined") {
      let loader = this.loadingCtrl.create({
        content: "Chargement de Mobile First...",
      });
      loader.present();
      console.log("Mobile First JavaScript needs to be loaded.");
      this.loadScript(0).then(resp0 => {
        this.loadScript(1).then(resp1 => {
          this.events.publish("mfpJsLoaded", null);
          this.mfpReady['ready'] = true;
          loader.dismiss();
        });
      });
    } else {
      console.log("Mobile First Cordova Module is loaded", WL);
      this.mfpReady['ready'] = true;
    }
  }
  loadScript(idx) {
    return new Promise((resolve, reject) => {
      let sc = this.lstScript[idx];
      console.debug("-- Load ", sc.id);
      let script = document.createElement("script");
      script.id = sc.id;
      script.src = sc.src;
      script.async = true;
      script.defer = true;
      script.onload = function () {
        console.debug("-- ", sc.id, "loaded");
        resolve(true);
      }
      document.body.appendChild(script);
    });
  }
  mfpInit() {
    let me = this;
    // init Mobile First SDK
    var wlInitOptions = {
      mfpContextRoot: '/mfp', // "mfp" is the default context root in the MobileFirst Foundation
      applicationId: 'fr.smabtp.pocClient' // Replace with your own value.
    };
    WL.Client.init(wlInitOptions).then(
      function () {
        // Application logic.
        console.debug('-- WL client init done', WL);
        console.debug('-- trying to obtain authorization token');
        WLAuthorizationManager.obtainAccessToken().then(success => {
          console.debug('-- succesfully got a token', success);
          me.events.publish("mfpAccess", success);
          me.mfpReady['connect'] = true;
        }, error => {
          console.error('-- error got a token', error);
          me.mfpReady['connect'] = false;
        });
      });
    this.PinCodeChallengeHandler = WL.Client.createSecurityCheckChallengeHandler("PinCodeAttempts");
    this.PinCodeChallengeHandler.handleChallenge = function (challenge) {
      var msg = "";
      // Create the title string for the prompt
      if (challenge.errorMsg !== null) {
        msg = challenge.errorMsg + "\n";
      }
      else {
        msg = "Accés sécurisé par code PIN.\n";
      }
      msg += "Essais restant : " + challenge.remainingAttempts;
      // Display a prompt for user to enter the pin code
      me.displayPin(msg);
    };
    // handleFailure
    this.PinCodeChallengeHandler.handleFailure = function (error) {
      console.log("Challenge Handler Failure!");
      WL.Logger.debug("Challenge Handler Failure!");
      if (error.failure !== null && error.failure !== undefined) {
        let alert = me.alertCtrl.create({
          title: 'Accè refusé',
          subTitle: error.failure,
          buttons: ['Fermer']
        });
        alert.present();
      } else {
        let toast = me.toastCtrl.create({
          message: 'Erreur inconnue',
          duration: 3000,
          position: 'top'
        });
        toast.present();
      }
    };
  }
  displayPin(msg) {
    let alert = this.alertCtrl.create({
      title: 'Vérification de la sécurité',
      subTitle: msg,
      inputs: [{ name: 'pinCode', placeholder: 'Code PIN' }],
      buttons: [
        {
          text: 'Annuler',
          role: 'cancel',
          handler: data => {
            console.log('Cancel clicked');
          }
        },
        {
          text: 'Valider',
          handler: data => {
            if (data.pinCode) { // calling submitChallengeAnswer with the entered value
              this.PinCodeChallengeHandler.submitChallengeAnswer({ "pin": data.pinCode });
            }
            else { // calling cancel in case user pressed the cancel button
              this.PinCodeChallengeHandler.cancel();
            }
          }
        }
      ]
    });
    alert.present();
  }
  displayLogin() {
    let prompt = this.alertCtrl.create({
      title: 'Login',
      message: "Enter your username and password",
      inputs: [
        { name: 'username', placeholder: 'Username' },
        { name: 'password', placeholder: 'Password', type: 'password' },
      ],
      buttons: [
        {
          text: 'Login',
          handler: data => {
            console.log('---> Trying to auth with user', data);
            //this.AuthHandler.submitChallengeAnswer(data);
          }
        }
      ]
    });
    prompt.present();
  }
}