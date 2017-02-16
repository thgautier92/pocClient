import { Component, Renderer } from '@angular/core';
import { NavController, NavParams, AlertController, LoadingController } from 'ionic-angular';
declare var WLResourceRequest;
declare var WL;

/*
  Generated class for the MfpApi page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/
@Component({
  selector: 'page-mfp-api',
  templateUrl: 'mfp-api.html'
})
export class MfpApiPage {
  displaySelector: boolean;
  lstApi: Array<{ group: string, name: string, des: string, url: string, protected: boolean }>;
  adapterReturn: any = null;
  AuthHandler: any;
  constructor(public navCtrl: NavController, public navParams: NavParams, public alertCtrl: AlertController,
    public renderer: Renderer,
    public loadingCtrl: LoadingController) {
    this.displaySelector = false;
    this.lstApi = [
      { group: "Adapters", name: "Server Check", des: "Vérification du serveur", url: "serverCheck", protected: false },
      { group: "Adapters", name: "Balance", des: "Calcul d'un nombre", url: "ResourceAdapter/balance", protected: true }
    ]
    renderer.listenGlobal('document', 'mfpjsloaded', () => {
    })
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad MfpApiPage');
  }

  getAdapter(item) {
    let loader = this.loadingCtrl.create({
      content: "Accès à l'adapter Mobile First...",
    });
    loader.present();
    let url = "/adapters/" + item.url;
    if (!item.protected) {
      url = url + "/unprotected"
    }
    var resourceRequest = new WLResourceRequest(url, WLResourceRequest.GET);
    resourceRequest.send().then((response) => {
      this.adapterReturn = response;
      console.log(this.adapterReturn);
      this.displaySelector = true;
      loader.dismiss();
    },
      function (error) {
        console.log(error);
        loader.dismiss();
      });
  }
}
