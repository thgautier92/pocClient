import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import { RestServices } from '../../providers/rest';
import { groupBy } from '../../pipes/comon';


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
  lstGroup: Array<{ group: string, name: string, des: string, logo: string, link: string }>;
  lstApi: Array<{ group: string, name: string, des: string, url: string, rowsApi: string }>;
  groupedApis: any = null;
  defaultParams: any = null;
  apiReturn: any = null;
  constructor(public navCtrl: NavController, public navParams: NavParams, public api: RestServices) {
    this.defaultParams = {
      rows: 100
    }

    this.lstGroup = [
      { group: "paris", name: "Open Data Paris", des: "Les données de la mairie de paris", logo: this.imgPath + "parisdata.jpg", link: "https://opendata.paris.fr/page/home/" },
      { group: "ratp", name: "Ratp", des: "Informations transport", logo: this.imgPath + "RATP_LOGO.png", link: "https://data.ratp.fr/explore/?sort=modified" }];
    this.lstApi = [
      {
        group: "paris",
        name: "parisWifi", des: "Antennes Wifi à Paris",
        url: "https://opendata.paris.fr/api/records/1.0/search/?dataset=liste-des-antennes-wifi&lang=fr&facet=code_postal",
        rowsApi: "rows"
      },
      {
        group: "paris",
        name: "Commerce", des: "Base de données des commerces",
        url: "https://opendata.paris.fr/api/records/1.0/search/?dataset=commercesparis&facet=arro&facet=situation&facet=libact",
        rowsApi: "rows"
      }
    ]
    this.groupedApis = new groupBy().transform(this.lstApi, 'group');
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad OpendataPage');
  }
  loadApi(item) {
    let url = item.url + "&" + item.rowsAPi + "=" + this.defaultParams.rows;
    this.api.loadApi(url, 0).then(response => {
      console.log(response);
      this.apiReturn = response;
    }, error => {
      console.error(error);
    })
  }
  openPage(page) {
    this.navCtrl.push(page.page);
  }
  openUrl(item) {
    window.open(item.link);
  }

}
