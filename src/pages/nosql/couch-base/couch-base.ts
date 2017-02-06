import { Component } from '@angular/core';
import { NavController, NavParams, ViewController, ModalController, PopoverController, ToastController, Events } from 'ionic-angular';
import { CouchDbServices } from '../../../providers/couch/couch';
import { ParamsPage } from '../params/params';
declare var ace: any;
/*
  Generated class for the CouchBase page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/
@Component({
    selector: 'page-couch-base',
    templateUrl: 'couch-base.html'
})
export class CouchBasePage {
    params: any = null;
    lstBases: any = [];
    dbInfo: any = {};
    baseItems: any = [];
    noSqlEnv: any = {};
    displaySelector: any = false;
    constructor(public navCtrl: NavController, public popoverCtrl: PopoverController,
        public modalCtrl: ModalController, public toastCtrl: ToastController,
        public events: Events,
        private couch: CouchDbServices) {
        this.events.subscribe("ParamsChanged", data => {
            let toast = this.toastCtrl.create({
                message: 'Changement de serveur...',
                duration: 3000
            });
            toast.present();
            this.params = data;
            this.getLstBases();
        })
        this.noSqlEnv = { "base": "", "dbInfo": false, "rows": 0, "dbData": false, "range": 10, "skip": 0, "page": 0 }
    }
    ionViewDidLoad() {
        console.log('Hello CouchBasePage Page');
    }
    ngOnInit() {
        this.couch.getParams().then(data => {
            //console.log("Params", data);
            this.params = data;
            this.getLstBases();
        }).catch(error => {
            this.params = null;
            this.getLstBases();
        })
    }
    gotoParams() {
        this.navCtrl.push(ParamsPage);
    }
    getLstBases() {
        this.couch.getDabases('_all_dbs', this.params).then(response => {
            //console.log(response);
            this.lstBases = response;
        }, error => {
            console.error(error);
        })
    }
    dbPopover(myEvent) {
        let popover = this.popoverCtrl.create(dbPopoverPage, this.lstBases);
        popover.present({
            ev: myEvent
        });
        popover.onDidDismiss(data => {
            this.noSqlEnv['base'] = data;
            this.events.publish('baseChange', data);
        });
    }
}
// ===== popover for database choice =====
@Component({
    selector: 'page-couch-base-list',
    templateUrl: 'couch-base-list.html'
})
export class dbPopoverPage {
    lstBases: any = [];
    base: any = "";
    constructor(public viewCtrl: ViewController, private navParams: NavParams) {
        //console.log(navParams);
    }
    ngOnInit() {
        this.lstBases = this.navParams['data'];
        this.base = "";
    }
    changeBase() {
        if (this.base !== "") {
            this.viewCtrl.dismiss(this.base);
        }
    }
    close() {
        this.viewCtrl.dismiss();
    }
}
