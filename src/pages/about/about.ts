import { Component, Input, ViewChild } from '@angular/core';
import { NavController, ModalController, Slides, Platform } from 'ionic-angular';
import { RestServices } from '../../providers/rest';
import { FilesOperation } from '../../providers/files-operation';

import { PdfComponent } from '../../components/pdf/pdf';

/*
  Generated class for the About page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/
@Component({
  selector: 'page-about',
  templateUrl: 'about.html'
})
export class About {
  @ViewChild(Slides) aboutSlides: Slides;
  dataTest: any;
  dataResults: any = [];
  imgPath: any = "assets/img/";
  lstTechno: Array<{ name: string, version: string, des: string, img: string, link: string }>;
  infoApp: Array<{ name: string, data: any }>;
  constructor(public navCtrl: NavController, public modalCtrl: ModalController, public platform: Platform, public rest: RestServices, public filesOpe: FilesOperation) {
    this.lstTechno = [
      { name: "IONIC", version: "2.0", des: "Framework de présentation graphique, compatible multi-platformes mobile", img: this.imgPath + "ionic.png", link: "https://ionicframework.com/" },
      { name: "ANGULAR", version: "2.0", des: "Framework d'intégration des données en provenance du SI, en mode objet", img: this.imgPath + "angular.png", link: "https://angular.io/" },
      { name: "JSON FORMATER", version: "", des: "Framework de présentation structurée de données au format JSON", img: this.imgPath + "json.gif", link: "https://github.com/mohsen1/json-formatter" },
      { name: "ACE Editor", version: "", des: "Framework d'edition de texte, multi-formats", img: this.imgPath + "ace-logo.png", link: "https://ace.c9.io/" },
      { name: "POUCHDB", version: "", des: "Framework de gestion locale NOSQL, synchronisée avec COUCHDB. Mode mobile OFFLINE", img: this.imgPath + "pouchdb.png", link: "https://pouchdb.com/" }
    ]
    this.infoApp = [
      { name: "Plateformes", data: platform.platforms() },
      { name: "Versions", data: platform.versions() },
      { name: "Navigateur Web", data: window.navigator.userAgent },
      { name: "Configuration", data: platform.getPlatformConfig('core') },
    ];

  }
  ionViewDidLoad() {
    console.log('Hello About Page');
  }
  ngAfterViewInit() {
    this.aboutSlides.options = {
      pager: true, paginationType: 'progress',
      loop: true, initialSlide: 0,
      speed: 300, direction: 'vertical'
    };
  }
  onSlideChanged(evt) { console.log(evt); }
  openUrl(item) {
    window.open(item.link);
  }
  // ===== Services for testing framework or action =====
  testRest() {
    this.rest.load().then(data => {
      this.dataTest = data;
      this.dataResults = data['results'];
    }, error => {
      this.dataTest = error;
    })
  }

  openPdf() {
    let url = "/assets/data/docs/batiretraite_iv0590f_transformationfourgous.pdf";
    this.navCtrl.push(PdfComponent, url);
  }
  openFile() {
    //console.log(this.filesOpe.verifTemp());
    let url = "http://gautiersa.fr/api/v2/demo/doc.pdf"
    this.filesOpe.downloadFile(url);
  }
  delete(chip: Element) {
    chip.remove();
  }
}
