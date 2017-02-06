import { Component, ViewChild } from '@angular/core';
import { Content, NavController, NavParams, ViewController, ModalController, PopoverController, ToastController, AlertController, Events } from 'ionic-angular';
import { CouchDbServices } from '../../../providers/couch/couch';
import { ParamsPage } from '../params/params';
declare var ace: any;
declare var PouchDB: any;

/*
  Generated class for the Pouch page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/
@Component({
  selector: 'page-pouch',
  templateUrl: 'pouch.html'
})
export class PouchPage {
  @ViewChild(Content) content: Content;
  params: any = null;
  srv: any;
  lstBases: any = [];
  noSqlEnv: any = {};
  noSqlLocalEnv: any = {};
  displaySelector: any = false;
  syncHandler: any;
  syncInfo: any = [];
  constructor(public navCtrl: NavController, public popoverCtrl: PopoverController,
    public modalCtrl: ModalController, public toastCtrl: ToastController, public alertCtrl: AlertController,
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
    this.noSqlLocalEnv = {
      "base": "", "dbInfo": false,
      "dbSync": false, "synchro": false,
      "rows": 0, "dbData": false, "range": 10, "skip": 0, "page": 0
    }
  }
  ionViewDidLoad() {
    console.log('Hello PouchPage Page');
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
  scrollToTop() {
    this.content.scrollToTop();
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
  selectLocalBases() {
    let prompt = this.alertCtrl.create({
      title: 'Base locale',
      message: "Entrer le nom de la base locale à synchroniser vers le serveur.",
      inputs: [
        {
          name: 'name',
          placeholder: 'Nom de la base'
        },
      ],
      buttons: [
        {
          text: 'Annuler',
          handler: data => {
            console.log('Cancel clicked');
          }
        },
        {
          text: 'Selectionner',
          handler: data => {
            console.log('Saved clicked', data);
            if (data) {
              this.noSqlEnv['base'] = data.name;
              this.noSqlLocalEnv['base'] = data.name;
              this.events.publish("baseChange", data.name);
              //this.getBaseData();
            }
          }
        }
      ]
    });
    prompt.present();

  }
  dbPopover(myEvent) {
    let popover = this.popoverCtrl.create(dbPopoverPouchPage, this.lstBases);
    popover.present({
      ev: myEvent
    });
    popover.onDidDismiss(data => {
      if (data) {
        this.noSqlEnv['base'] = data;
        this.noSqlLocalEnv['base'] = data;
        this.events.publish("baseChange", data);
        //this.getBaseData();
      }
    });
  }
}
// ===== Popover for database choice =====
@Component({
  selector: 'page-pouch-base-list',
  templateUrl: 'pouch-base-list.html'
})
export class dbPopoverPouchPage {
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
