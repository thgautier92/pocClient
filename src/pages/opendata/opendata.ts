import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import { RatpPage } from './ratp/ratp';

/*
  Generated class for the Opendata page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/
@Component({
  selector: 'page-opendata',
  templateUrl: 'opendata.html'
})
export class OpendataPage {
  imgPath: any = "assets/img/";
  products: any;
  constructor(public navCtrl: NavController, public navParams: NavParams) {
    this.products = [
      { "id": "ratp", "title": "", "description": "Les données diffusées par la RATP", "logo": this.imgPath + "RATP_LOGO.png", "page": RatpPage },
    ];
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad OpendataPage');
  }
  openPage(page) {
    this.navCtrl.push(page.page);
  }

}
