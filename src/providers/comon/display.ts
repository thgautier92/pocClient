import { LoadingController, ToastController, AlertController, NavController } from 'ionic-angular';
import { Injectable } from '@angular/core';

/*
  Generated class for the Display provider.

  See https://angular.io/docs/ts/latest/guide/dependency-injection.html
  for more info on providers and Angular 2 DI.
*/
@Injectable()
export class DisplayTools {
    constructor(public nav: NavController,
        public toastCtrl: ToastController,
        public loadingCtrl: LoadingController,
        public alertCtrl: AlertController) {
        this.nav = nav;
    }
    displayLoading(msg, second?) {
        let opt = { content: msg, dismissOnPageChange: false };
        if (second) {
            opt['duration'] = second * 1000;
            opt['dismissOnPageChange'] = true;
        }
        let act = this.loadingCtrl.create(opt);
        act.present();
        return act.instance;
    }
    displayToast(msg, duration?) {
        if (!duration) duration = 2000
        let toast = this.toastCtrl.create({
            message: msg,
            duration: duration,
            showCloseButton: true,
            closeButtonText: "Fermer",
            dismissOnPageChange: false,
            cssClass: "toastInfo"
        });
        toast.onDidDismiss(() => {
            //console.log('Dismissed toast');
        });
        toast.present();
    }
    displayAlert(msg) {
        let alert = this.alertCtrl.create({
            "title": "Message important",
            subTitle: msg,
            buttons: ["J'ai compris"]
        })
        alert.present();
    }
    displayJson(el, data) {

    }
    getRandomColor() {
        var letters = '0123456789ABCDEF'.split('');
        var color = '#';
        for (var i = 0; i < 6; i++) {
            color += letters[Math.floor(Math.random() * 16)];
        }
        return color;
    }
}