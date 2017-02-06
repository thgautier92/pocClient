import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';

/*
  Generated class for the Harvest page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/
@Component({
  selector: 'page-harvest',
  templateUrl: 'harvest.html'
})
export class Harvest {

  constructor(public navCtrl: NavController) {}

  ionViewDidLoad() {
    console.log('Hello Harvest Page');
  }

}
