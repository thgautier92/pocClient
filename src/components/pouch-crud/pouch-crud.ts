import { Component, Input } from '@angular/core';
import { NavController, NavParams, ViewController, ModalController, PopoverController, ToastController, Events } from 'ionic-angular';
declare var ace: any;
declare var PouchDB: any;

/*
  Generated class for the PouchCrud component.

  See https://angular.io/docs/ts/latest/api/core/index/ComponentMetadata-class.html
  for more info on Angular 2 Components.
*/
@Component({
  selector: 'pouch-crud',
  templateUrl: 'pouch-crud.html'
})
export class PouchCrudComponent {
  @Input() noSqlLocalEnv: any;
  @Input() params: any;
  localDbInfo: any = {};
  localBaseItems: any = [];
  displaySelector: any = false;
  localDB: any;
  syncHandler: any;
  syncInfo: any = [];
  syncActive: boolean = false;
  constructor(public navCtrl: NavController, public popoverCtrl: PopoverController,
    public modalCtrl: ModalController, public toastCtrl: ToastController,
    public events: Events) {
    console.log('Hello PouchCrud Component');
    // Get Srv parameters
    this.events.subscribe('baseChange', data => {
      this.connectLocalBase();
      this.getLocalBaseData();
    });
    this.events.subscribe("localRefresh", data => {
      this.connectLocalBase();
      this.getLocalBaseData();
    });
    this.events.subscribe("localDataToSave", data => {
      //console.log("dataToSave", data);
      let dataToSave = data;
      this.localDB.get(dataToSave['_id']).then(doc => {
        dataToSave['_rev'] = doc._rev;
        this.localDB.put(dataToSave).then(response => {
          // handle response
          this.getLocalBaseData();
          let toast = this.toastCtrl.create({
            message: 'Enregistrement réussi.',
            duration: 3000
          });
          toast.present();
        }).catch(error => {
          console.log("ERR save DATA", error);
          let toast = this.toastCtrl.create({
            message: 'Erreur de sauvegarde',
            duration: 3000
          });
          toast.present();
        });
      }).catch(error => {
        console.log("ERR save DATA", error);
        let toast = this.toastCtrl.create({
          message: 'Erreur de sauvegarde',
          duration: 3000
        });
        toast.present();
      });
    });
  }
  ngOnInit() {
    this.connectLocalBase();
  }
  ngOnChanges(changes: any) {
    //console.log("Source Change for local", changes);
    this.connectLocalBase();
  }
  // ===== Navigate on LOCAL data page =====
  connectLocalBase() {
    if (this.noSqlLocalEnv['base'] !== "") {
      this.localDB = new PouchDB(this.noSqlLocalEnv['base']);
    } else {
      this.localDB = null;
    }
    //console.log(this.localDB, this.noSqlLocalEnv);
  }
  resetLocalBase() {
    if (this.localDB) {
      this.localDB.destroy().then(response => {
        this.noSqlLocalEnv = {
          "base": "", "dbInfo": false,
          "dbSync": false, "synchro": false,
          "rows": 0, "dbData": false, "range": 10, "skip": 0, "page": 0
        };
        this.localBaseItems = [];
      }).catch(function (err) {
        console.log(err);
      });
    }
  }
  getLocalBaseInfo() {
    if (this.localDB) {
      this.localDB.info().then(response => {
        this.localDbInfo = response;
        this.noSqlLocalEnv['dbInfo'] = true;
      }, error => {
        console.error(error);
      });
    }
  };
  getLocalBaseData() {
    if (this.localDB) {
      this.localDB.allDocs({
        include_docs: true
      }).then(response => {
        //console.log(response);
        this.localBaseItems = response['rows'];
        this.noSqlLocalEnv['rows'] = response['total_rows'];
        this.noSqlLocalEnv['page'] = response['offset'];
        this.noSqlLocalEnv['dbData'] = true;
      }, error => {
        console.error(error);
      })
    }
  }
  getLocalBaseStart() {
    this.noSqlLocalEnv['skip'] = 0;
    this.getLocalBaseData();
  }
  getLocalBasePrevious() {
    this.noSqlLocalEnv['skip'] = this.noSqlLocalEnv['skip'] - this.noSqlLocalEnv['range'];
    if (this.noSqlLocalEnv['skip'] < 0) this.noSqlLocalEnv['skip'] = 0;
    this.getLocalBaseData();
  }
  getLocalBaseNext() {
    this.noSqlLocalEnv['skip'] = this.noSqlLocalEnv['skip'] + this.noSqlLocalEnv['range'];
    if (this.noSqlLocalEnv['skip'] > this.noSqlLocalEnv['rows']) this.noSqlLocalEnv['skip'] = 0;
    this.getLocalBaseData();
  }
  getLocalBaseEnd() {
    this.noSqlLocalEnv['skip'] = this.noSqlLocalEnv['rows'] - 2;
    this.getLocalBaseData();
  }
  // Add or edit data
  addLocalBaseData() {
    this.navCtrl.push(dbEditLocalDataPage);
  }
  editLocalBaseData(item) {
    this.navCtrl.push(dbEditLocalDataPage, item['doc']);
  }
  deleteLocalBaseData(item, idx) {
    //console.log(item);
    if (this.localDB) {
      this.localDB.get(item['doc']['_id']).then(doc => {
        return this.localDB.remove(doc);
      }).then(result => {
        // handle result
        let toast = this.toastCtrl.create({
          message: 'Enr. supprimé.',
          duration: 3000
        });
        toast.present();
        this.getLocalBaseData();
      }).catch(err => {
        console.log("ERR DELETE DATA", err);
        let toast = this.toastCtrl.create({
          message: 'Erreur de suppression',
          duration: 3000
        });
        toast.present();
      });
    }
  }
  // ===== SYNCHRONIZE OPERATIONS =====
  changeSynchro() {
    if (this.noSqlLocalEnv['synchro']) {
      this.synchroStart();
    } else {
      this.synchroStop();
    }
  }
  synchroStart() {
    var localDB = new PouchDB(this.noSqlLocalEnv['base']);
    var remoteDB = new PouchDB("http://" + this.params['user'] + ":" + this.params['password'] + "@" + this.params['srv'] + '/' + this.noSqlLocalEnv['base']);
    console.info("Start synchro base", this.noSqlLocalEnv['base'], remoteDB);
    this.syncHandler = localDB.sync(remoteDB, {
      live: true,
      retry: true
    }).on('change', change => {
      console.log('Change', change);
      if (change) this.syncInfo.push({ "evt": "change", "data": change });
      this.syncActive = true;

    }).on('paused', info => {
      // replication was paused, usually because of a lost connection
      console.log('Paused', info);
      if (info) this.syncInfo.push({ "evt": "paused", "data": info });
      this.syncActive = false;

    }).on('active', info => {
      // replication was resumed
      console.log('Resume', info);
      if (info) this.syncInfo.push({ "evt": "active", "data": info });
      this.events.publish("localRefresfh");
      this.syncActive = true;

    }).on('error', err => {
      // totally unhandled error (shouldn't happen)
      console.log('Error', err);
      this.syncInfo.push({ "evt": "error", "data": err });
      this.syncActive = false;
    });
    this.syncHandler.on('complete', info => {
      // replication was canceled!
      console.log("Canceled", info);
      this.syncInfo.push({ "evt": "complete", "data": info });
      this.syncActive = false;
    });
  }
  synchroStop() {
    this.syncHandler.cancel();
    this.syncActive = false;
  }
}
// ===== popover for record edit =====
@Component({
  selector: 'page-crud-base-detail',
  templateUrl: 'pouch-crud-detail.html'
})
export class dbEditLocalDataPage {
  aceEditor: any;
  dataEdit: any
  text: any;
  constructor(public viewCtrl: ViewController, private navParams: NavParams, public events: Events) {
    console.log(navParams);
  }
  ngOnInit() {
    if (Object.keys(this.navParams['data']).length > 0) {
      this.dataEdit = this.navParams['data'];
    } else {
      this.dataEdit = { "_id": "idDocument", "key": "value", "array": [{ "key": "value" }, { "key": "value" }] };
    }
    this.text = JSON.stringify(this.dataEdit, null, '\t');
    this.loadEditor(this.text, "editor", "json");
  }
  loadEditor(text, field, mode) {
    this.aceEditor = ace.edit(field);
    this.aceEditor.$blockScrolling = Infinity;
    this.aceEditor.setTheme("ace/theme/eclipse");
    this.aceEditor.getSession().setMode("ace/mode/" + mode);
    this.aceEditor.getSession().setValue(text);
  }
  cancelDetail() {
    this.viewCtrl.dismiss();
  }
  saveDetail() {
    try {
      let t = JSON.parse(this.aceEditor.getSession().getValue());
      this.events.publish("localDataToSave", t);
      this.viewCtrl.dismiss();
    } catch (e) {
      console.log("JSON ERROR", e);
    }
  }
}
