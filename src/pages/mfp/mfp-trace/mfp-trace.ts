import { Component, ViewChild } from '@angular/core';
import { NavController, NavParams, Content } from 'ionic-angular';
declare var WL: any;

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
  constructor(public navCtrl: NavController, public navParams: NavParams) {
    this.status = null;
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad MfpTracePage');
  }
  scrollToTop() {
    this.content.scrollToTop();
  }
  pressEvent(e) {
    console.log(e);
    this.press++;
    this.logActions.push({ "ts": e.timeStamp, "action": "press", "data": e });
  }
  panEvent(e) {
    this.pan++;
    this.logActions.push({ "ts": e.timeStamp, "action": "pan", "data": e });
  }
  swipeEvent(e) {
    this.swipe++;
    this.logActions.push({ "ts": e.timeStamp, "action": "swipe", "data": e });
  }
  tapEvent(e) {
    this.tap++;
    this.logActions.push({ "ts": e.timeStamp, "action": "tap", "data": e });
  }
  resetLog() {
    this.logActions = [];
  }
  sendLog() {

  }
  stopLog() {
    WL.Logger.config({ capture: false });
  }
  statusLog() {

  }
  analyticLog() {

  }
}
