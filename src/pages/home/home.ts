import { Component } from '@angular/core';
import { NavController, ToastController, Events } from 'ionic-angular';
//import { PocData } from '../poc-data/poc-data';
import { ParamsPage } from '../nosql/params/params';
import { PdfGen } from '../pdf-gen/pdf-gen';
import { Sign } from '../sign/sign';
import { Simu } from '../simu/simu';
import { NosqlPage } from '../nosql/nosql';
import { MfpPage } from '../mfp/mfp';
import { OpendataPage } from '../opendata/opendata';
import { CouchDbServices } from '../../providers/couch/couch';

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class Home {
  imgPath: any = "assets/img/";
  pages: any = [];
  lstUseCase: any = [];
  useCaseNum: number = 0;
  params: any = null;
  constructor(public navCtrl: NavController, public toastCtrl: ToastController, public couch: CouchDbServices, public events: Events) {
    this.pages = [
      { title: 'Signature electronique', component: Sign, icon: "people", img: this.imgPath + "signature_web.jpg", color: "primary", "dataKey": "sign", "useCaseNum": 0 },
      { title: 'Simulateurs', component: Simu, icon: "people", img: this.imgPath + "billets-euros.large.jpg", color: "primary", "dataKey": "simu", "useCaseNum": 0 },
      { title: 'Generateur PDF', component: PdfGen, icon: "docs", img: this.imgPath + "pdfDoc.png", color: "primary", "dataKey": "pdf", "useCaseNum": 0 },
      { title: 'Base NOSQL', component: NosqlPage, icon: "docs", img: this.imgPath + "nosql-net_logo_transparent.png", color: "primary", "dataKey": "nosql", "useCaseNum": 0 },
      { title: 'Mobile First', component: MfpPage, icon: "docs", img: this.imgPath + "MobileFirst-Logo.jpg", color: "primary", "dataKey": "mfp", "useCaseNum": 0 },
      { title: 'Open Data', component: OpendataPage, icon: "docs", img: this.imgPath + "opendata.jpeg", color: "primary", "dataKey": "opendata", "useCaseNum": 0 }
    ];
    this.events.subscribe("ParamsChanged", data => {
      let toast = this.toastCtrl.create({
        message: 'Changement de serveur...',
        duration: 3000
      });
      toast.present();
      this.params = data;
      this.getUseCaseStat();
    })
  }
  ngOnInit() {
    this.couch.getParams().then(data => {
      //console.log("Params", data);
      this.params = data;
      this.getUseCaseStat();
    }).catch(error => {
      this.params = null;
      this.getUseCaseStat();
    })
  }
  getUseCaseStat(refresher?) {
    this.couch.getDbViewCount('poc_data', 'countByType', this.params).then(response => {
      //console.log(response);
      response['rows'].forEach(element => {
        if (element.key) {
          let f = this.pages.findIndex(item => item.dataKey == element.key)
          if (f >= 0) {
            this.pages[f]['useCaseNum'] = element.value;
          }
        }
      });
      if (refresher) refresher.complete();
    }, error => {
      if (refresher) refresher.complete();

      let toast = this.toastCtrl.create({
        message: 'Erreur de comptage des cas de test : ' + error['reason'],
        duration: 5000
      });
      toast.present();
      // Try to create the DataBase and Filters
      this.couch.createBase('poc_data', this.params).then(createResponse => {
        console.log(createResponse);
        this.couch.createFilters('poc_data', 'filter', this.params).then(filterResponse => {
          let toastCreate = this.toastCtrl.create({
            message: 'Configuration rétablie',
            duration: 2000
          });
          toastCreate.present();
        }, filterError => {
          // Filter error
          let toastCreate = this.toastCtrl.create({
            message: 'Erreur de configuration : ' + error['reason'],
            duration: 2000
          });
          toastCreate.present();
        })
      }, createError => {
        // Try to restore filters
        this.couch.createFilters('poc_data', 'filter', this.params).then(filterResponse => {
          let toastCreate = this.toastCtrl.create({
            message: 'Configuration rétablie',
            duration: 2000
          });
          toastCreate.present();
          toast.dismiss();
        }, filterError => {
          let toastCreate = this.toastCtrl.create({
            message: 'Erreur de configuration : ' + error['reason'],
            duration: 5000
          });
          toastCreate.present();
        })

      })
    })
  }
  openPage(page) {
    this.navCtrl.push(page.component);
  }
  gotoParams() {
    this.navCtrl.push(ParamsPage);
  }
}
