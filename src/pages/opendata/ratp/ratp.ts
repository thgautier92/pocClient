import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import { RestServices } from '../../../providers/rest';
import { groupBy } from '../../../pipes/comon';

/*
  Generated class for the Ratp page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/
@Component({
  selector: 'page-ratp',
  templateUrl: 'ratp.html'
})
export class RatpPage {
  lstApi: Array<{ group: string, name: string, des: string, url: string, rowsApi: string }>
  groupedApis: any = null;
  defaultParams: any = null;
  apiReturn: any = null;
  constructor(public navCtrl: NavController, public navParams: NavParams, public api: RestServices) {
    this.defaultParams = {
      rows: 100
    }
    this.lstApi = [
      {
        group: "Paris",
        name: "parisWifi", des: "Antennes Wifi à Paris",
        url: "https://opendata.paris.fr/api/records/1.0/search/?dataset=liste-des-antennes-wifi&lang=fr&facet=code_postal",
        rowsApi: "rows"
      },
      {
        group: "Paris",
        name: "Commerce", des: "Base de données des commerces",
        url: "https://opendata.paris.fr/api/records/1.0/search/?dataset=commercesparis&facet=arro&facet=situation&facet=libact",
        rowsApi: "rows"
      }
    ]
    this.groupedApis = new groupBy().transform(this.lstApi, 'group');
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad RatpPage');
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

}
