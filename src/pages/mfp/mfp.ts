import { Component } from '@angular/core';
import { NavController, NavParams, Events } from 'ionic-angular';
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
  constructor(public navCtrl: NavController, public navParams: NavParams, public events: Events) {
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
      console.log("Mobile First JavaScript needs to be loaded.");
      this.loadScript(0).then(resp0 => {
        this.loadScript(1).then(resp1 => {
          this.events.publish("mfpJsLoaded", null);
          this.mfpReady['ready'] = true;
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
      let me = this;
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
  }
}
// JavaScript
function wait(ms) {
  var start = new Date().getTime();
  var end = start;
  while (end < start + ms) {
    end = new Date().getTime();
  }
}