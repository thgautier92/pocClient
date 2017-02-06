import { Component } from '@angular/core';
import { NavController, NavParams, Events } from 'ionic-angular';
import { MfpTracePage } from "./mfp-trace/mfp-trace";
import { MfpApiPage } from "./mfp-api/mfp-api";
declare var WL: any;
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
  constructor(public navCtrl: NavController, public navParams: NavParams, public events: Events) {
    this.tab1 = MfpTracePage;
    this.tab2 = MfpApiPage;
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
      let lstScript = [
        { "id": "mfpAnalyticsInit", "src": "assets/mfp/lib/analytics/ibmmfpfanalytics.js" },
        { "id": "mfpInit", "src": "assets/mfp/ibmmfpf.js" }
      ];
      lstScript.forEach(sc => {
        let script = document.createElement("script");
        script.id = sc.id;
        script.src = sc.src;
        document.body.appendChild(script);
      });
      this.events.publish("mfpJsLoaded", null);
    }

  }
  mfpInit() {
    // init Mobile First SDK
    var wlInitOptions = {
      mfpContextRoot: '/mfp', // "mfp" is the default context root in the MobileFirst Foundation
      applicationId: 'fr.smabtp.pocClient' // Replace with your own value.
    };
    WL.Client.init(wlInitOptions).then(
      function () {
        // Application logic.
        console.log(WL);
      });
  }
}
