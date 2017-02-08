import { Component } from '@angular/core';
import { NavController, Events } from 'ionic-angular';
import { CouchDbServices } from '../../../providers/couch/couch';
import { Storage } from '@ionic/storage';
const storageVar: any = "couch_params";
const defaultParams: any = { "srv": "localhost:5984", "user": "admin", "password": "" };
/*
  Generated class for the Params page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/
export class params {
  srv: string;
  user: string;
  password: string;
}
@Component({
  selector: 'page-params',
  templateUrl: 'params.html'
})
export class ParamsPage {
  params: any;
  msg: any = "";
  okTest: boolean = false;
  constructor(public navCtrl: NavController,
    public events: Events,
    public storage: Storage, private couch: CouchDbServices) { }

  ionViewDidLoad() {
    console.log('Hello ParamsPage Page');
  }
  ngOnInit() {
    this.params = new params;
    this.getParams().then(data => {
      this.params = data;
      //console.log("Params ok");
    }).catch(err => {
      this.params.srv = defaultParams['srv'];
      this.params.user = defaultParams['user'];
      this.params.password = defaultParams['password'];
    })
    console.log(this.storage);
  }
  cancelParams() {
    this.navCtrl.pop();
  }
  saveParams() {
    this.storage.set(storageVar, JSON.stringify(this.params));
    this.events.publish("ParamsChanged", this.params);
    this.navCtrl.pop();

  }
  getParams() {
    return new Promise((resolve, reject) => {
      this.storage.get(storageVar).then((val) => {
        if (val) {
          let p = JSON.parse(val);
          resolve(p);
        } else {
          reject(null);
        }
      }).catch(error => {
        console.error(error);
        reject(null);
      })
    });

  }
  resetParams() {
    this.params = defaultParams;
  }
  testParams() {
    this.msg = "";
    this.couch.getDabases("", this.params).then(response => {
      this.msg = "Serveur disponible";
      this.okTest = true;
    }, error => {
      this.msg = "Serveur indisponible.Veuillez vérifier les paramètres.";
      console.error(error);
      this.okTest = false;
    })
  }
}
