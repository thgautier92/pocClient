import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';

/*
  Generated class for the Epicaste page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/
@Component({
  selector: 'page-epicaste',
  templateUrl: 'epicaste.html'
})
export class Epicaste {

  constructor(public navCtrl: NavController) {}

  ionViewDidLoad() {
    console.log('Hello Epicaste Page');
  }

}
