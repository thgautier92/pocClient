import { Component } from '@angular/core';
import { NavController, NavParams, Events } from 'ionic-angular';

/*
  Generated class for the MfpInfo page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/
@Component({
  selector: 'page-mfp-info',
  templateUrl: 'mfp-info.html'
})
export class MfpInfoPage {
  infos: Array<{ name: string, des: string, data: string }>;
  infoAccess: any;
  constructor(public navCtrl: NavController, public navParams: NavParams, public events: Events) {
    this.infos = [];
    this.events.subscribe("mfpAccess", data => {
      //console.log(data);
      this.infos.push({ "name": 'accessToken', "des": "Clé d'accés", "data": JSON.stringify(data) });
    })
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad MfpInfoPage');
  }

}
