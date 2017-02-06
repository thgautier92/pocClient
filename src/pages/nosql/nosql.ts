import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import { ParamsPage } from './params/params';
import { CouchBasePage } from './couch-base/couch-base';
import { CouchStatsPage } from './couch-stats/couch-stats';
import { PouchPage } from './pouch/pouch';

/*
  Generated class for the Nosql page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/
@Component({
  selector: 'page-nosql',
  templateUrl: 'nosql.html'
})
export class NosqlPage {
  imgPath: any = "assets/img/";
  products: any;
  constructor(public navCtrl: NavController) {
    this.products = [
      { "id": "couchbase", "title": "Le serveur NosSql", "description": "Explorer le contenu du serveur", "logo": this.imgPath + "couchdb-logo@2x.png", "page": CouchBasePage },
      { "id": "pouchbase", "title": "Le client OffLine", "description": "Base locale synchronisée", "logo": this.imgPath + "pouchdb.png", "page": PouchPage },
      { "id": "couchstats", "title": "Statistiques.", "description": "Statistiques d'utilisations du serveur", "logo": this.imgPath + "stats.jpg", "page": CouchStatsPage },
      { "id": "couchparams", "title": "Paramètres", "description": "Paramètres de connexion au serveur", "logo": this.imgPath + "couchdb-logo@2x.png", "page": ParamsPage }
    ];
  }

  ionViewDidLoad() {
    console.log('Hello NosqlPage Page');
  }
  openPage(page) {
    this.navCtrl.push(page.page);
  }
}
