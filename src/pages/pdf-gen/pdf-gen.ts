import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import { Jspdf } from './jspdf/jspdf';
import { Pdfmake } from './pdfmake/pdfmake';

/*
  Generated class for the PdfGen page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/
@Component({
  selector: 'page-pdf-gen',
  templateUrl: 'pdf-gen.html'
})
export class PdfGen {
  imgPath: any = "assets/img/";
  products: any;
  constructor(public navCtrl: NavController) {
    this.products = [
      { "id": "jsPdf", "title": "JsPDF", "description": "<a href='https://parall.ax/products/jspdf' target='_blank'>Voir le site</a>", "logo": this.imgPath + "pdf19.svg", "page": Jspdf },
      { "id": "pdfmake", "title": "PdfMake", "description": "", "logo": this.imgPath + "pdf19.svg", "page": Pdfmake }
    ];
  }

  ionViewDidLoad() {
    console.log('Hello PdfGen Page');
  }
  openPage(page) {
    this.navCtrl.push(page.page);
  }
}
