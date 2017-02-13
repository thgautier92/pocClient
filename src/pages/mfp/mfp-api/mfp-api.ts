import { Component, Renderer } from '@angular/core';
import { NavController, NavParams, AlertController } from 'ionic-angular';
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
    public renderer: Renderer) {
    this.displaySelector = false;
    this.lstApi = [{ group: "Adapters", name: "Server Check", des: "Check if the server is alive", url: "serverCheck", protected: false }]
    renderer.listenGlobal('document', 'mfpjsloaded', () => {
      this.AuthInit();
    })
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad MfpApiPage');
    this.AuthInit();
  }

  AuthInit() {
    console.log("Init Authentification", WL);
    this.AuthHandler = WL.Client.createSecurityCheckChallengeHandler("UserLogin");
    this.AuthHandler.handleChallenge((response) => {
      console.log("Auth response", response);
      if (response.errorMsg) {
        var msg = response.errorMsg + '<br>';
        msg += 'Remaining attempts: ' + response.remainingAttempts;
        WL.Logger.error("Auth error: " + response.errorMsg);
        WL.Logger.send();
      } else {
        this.DisplayLogin();
      }
    });
  }
  DisplayLogin() {
    let prompt = this.alertCtrl.create({
      title: 'Login',
      message: "Enter your username and password",
      inputs: [
        { name: 'username', placeholder: 'Username' },
        { name: 'password', placeholder: 'Password', type: 'password' },
      ],
      buttons: [
        {
          text: 'Login',
          handler: data => {
            console.log('---> Trying to auth with user', data);
            this.AuthHandler.submitChallengeAnswer(data);
          }
        }
      ]
    });
    prompt.present();
  }

  getAdapter(item) {
    let url = "/adapters/" + item.url;
    if (!item.protected) {
      url = url + "/unprotected"
    }
    var resourceRequest = new WLResourceRequest(url, WLResourceRequest.GET);
    resourceRequest.send().then((response) => {
      this.adapterReturn = response;
      console.log(this.adapterReturn);
      this.displaySelector = true;
    },
      function (error) {
        console.log(error);
      });
  }


}
