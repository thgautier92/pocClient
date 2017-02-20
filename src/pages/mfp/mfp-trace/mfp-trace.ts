import { Component, ViewChild } from '@angular/core';
import { NavController, NavParams, Content } from 'ionic-angular';
import { IbmAnalytics } from '../../../providers/ibm-analytics';
//declare var WL: any;
declare var ibmmfpfanalytics: any;

/*
  Generated class for the MfpTrace page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/
@Component({
  selector: 'page-mfp-trace',
  templateUrl: 'mfp-trace.html'
})
export class MfpTracePage {
  @ViewChild(Content) content: Content;
  public press: number = 0;
  public pan: number = 0;
  public swipe: number = 0;
  public tap: number = 0;
  logActions: any = [];
  detailActions: boolean = false;
  fnDispo: boolean = false;
  log: any;
  status: any;
  dataAnalytics: any = null;
  constructor(public navCtrl: NavController, public navParams: NavParams,
    public ibm: IbmAnalytics) {
    this.status = null;
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad MfpTracePage');
  }
  ngOnInit() {
    this.dispoLog();
  }

  scrollToTop() {
    this.content.scrollToTop();
  }
  pressEvent(e) {
    console.log(e);
    this.press++;
    this.logActions.push({ "ts": e.timeStamp, "trace": "gestes", "action": "press", "data": e });
  }
  panEvent(e) {
    this.pan++;
    this.logActions.push({ "ts": e.timeStamp, "trace": "gestes", "action": "pan", "data": e });
  }
  swipeEvent(e) {
    this.swipe++;
    this.logActions.push({ "ts": e.timeStamp, "trace": "gestes", "action": "swipe", "data": e });
  }
  tapEvent(e) {
    this.tap++;
    this.logActions.push({ "ts": e.timeStamp, "trace": "gestes", "action": "tap", "data": e });
  }
  resetLog() {
    this.logActions = [];
  }
  dispoLog() {
    if (ibmmfpfanalytics) {
      this.fnDispo = true;
    } else {
      this.fnDispo = false;
    }
  }
  sendLog() {
    console.log(ibmmfpfanalytics);
    let logger = ibmmfpfanalytics.logger;
    logger.enable(true);
    logger.info(this.logActions);
    ibmmfpfanalytics.send();
    logger.enable(false);
    this.logActions = [];
  }
  stopLog() {

  }
  statusLog() {

  }
  analyticLog() {
    this.ibm.getCustomChart().then(data => {
      console.debug("-- ANALYTICS", data);
      this.dataAnalytics = data;
    }, error => {
      console.error(error);
    })
  }
}
