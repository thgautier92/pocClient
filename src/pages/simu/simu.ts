import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import { Harvest } from './harvest/harvest';
import { Epicaste } from './epicaste/epicaste';

/*
  Generated class for the Simu page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/
@Component({
  selector: 'page-simu',
  templateUrl: 'simu.html'
})
export class Simu {
  imgPath: any = "assets/img/";
  products: any;
  constructor(public navCtrl: NavController) {
    this.products = [
      { "id": "harvest", "title": "", "description": "", "logo": this.imgPath + "logo_Harvest.png", "page": Harvest },
      { "id": "epicaste", "title": "Epicaste", "description": "", "logo": this.imgPath + "epigone.jpg", "page": Epicaste }
    ];
  }

  ionViewDidLoad() {
    console.log('Hello Simu Page');
  }
  openPage(page) {
    this.navCtrl.push(page.page);
  }

}
