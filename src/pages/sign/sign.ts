import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import { Docusign } from './docusign/docusign';
//import { Docapost } from './docapost/docapost';
//import { SellandsignPage } from './sellandsign/sellandsign';

/*
  Generated class for the Sign page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/
@Component({
  selector: 'page-sign',
  templateUrl: 'sign.html'
})
export class Sign {
  imgPath: any = "assets/img/";
  products: any;
  constructor(public navCtrl: NavController) {
    //{ "id": "docapost", "title": "", "description": "", "logo": this.imgPath + "Docapost.jpg", "page": Docapost },
    //{ "id": "sellandsign", "title": "", "description": "", "logo": this.imgPath + "NEW_SellSign_Horiz_150.png", "page": SellandsignPage }
    this.products = [
      { "id": "docusign", "title": "", "description": "Solution de signature électronique légale, simple et sécurisée pour envoyer et signer numériquement tous documents, depuis un PC ou un mobile", "logo": this.imgPath + "docuSign.jpg", "page": Docusign },
    ];
  }
  ionViewDidLoad() {
    console.log('Hello Sign Page');
  }
  openPage(page) {
    this.navCtrl.push(page.page);
  }

}
