import { Component, Input } from '@angular/core';
import { NavController, NavParams, ViewController, ModalController, PopoverController, ToastController, Events } from 'ionic-angular';
import { CouchDbServices } from '../../providers/couch/couch';
declare var ace: any;

/*
  Generated class for the CouchCrud component.

  See https://angular.io/docs/ts/latest/api/core/index/ComponentMetadata-class.html
  for more info on Angular 2 Components.
*/
@Component({
  selector: 'couch-crud',
  templateUrl: 'couch-crud.html'
})
export class CouchCrudComponent {
  @Input() noSqlEnv: any;
  @Input() params: any;
  dbInfo: any = {};
  baseItems: any = [];
  displaySelector: any = false;
  constructor(public navCtrl: NavController, public popoverCtrl: PopoverController,
    public modalCtrl: ModalController, public toastCtrl: ToastController,
    public events: Events,
    private couch: CouchDbServices) {
    console.log('Hello CouchCrud Component');
    //this.noSqlEnv = { "base": "", "dbInfo": false, "rows": 0, "dbData": false, "range": 10, "skip": 0, "page": 0 }
    this.events.subscribe('baseChange', data => {
      this.getBaseData();
    });
    this.events.subscribe("dataToSave", data => {
      //console.log("dataToSave", data);
      let dataToSave = data;
      this.couch.addDoc(this.noSqlEnv['base'], dataToSave, this.params).then(response => {
        this.getBaseData();
        let toast = this.toastCtrl.create({
          message: 'Enregistrement réussi.',
          duration: 3000
        });
        toast.present();
      }, error => {
        console.log("ERR save DATA", error);
        let toast = this.toastCtrl.create({
          message: 'Erreur de sauvegarde',
          duration: 3000
        });
        toast.present();
      })
    })
  }
  ngOnChanges(changes: any) {
    //console.log("Source Change", changes);
  }
  getBaseInfo() {
    let name = this.noSqlEnv['base'];
    if (name) {
      this.couch.getDabases(name.toLowerCase(), this.params).then(response => {
        //console.log(response);
        this.dbInfo = response;
        this.noSqlEnv['dbInfo'] = true;
      }, error => {
        console.error(error);
      })
    }
  };
  // Navigate on data page
  getBaseData() {
    let name = this.noSqlEnv['base'];
    if (name) {
      this.couch.getDbDocs(name.toLowerCase(), this.noSqlEnv['range'], this.noSqlEnv['skip'], this.params).then(response => {
        //console.log(response);
        this.baseItems = response['rows'];
        this.noSqlEnv['rows'] = response['total_rows'];
        this.noSqlEnv['page'] = response['offset'];
        this.noSqlEnv['dbData'] = true;
      }, error => {
        console.error(error);
      })
    }
  }
  getBaseStart() {
    this.noSqlEnv['skip'] = 0;
    this.getBaseData();
  }
  getBasePrevious() {
    this.noSqlEnv['skip'] = this.noSqlEnv['skip'] - this.noSqlEnv['range'];
    if (this.noSqlEnv['skip'] < 0) this.noSqlEnv['skip'] = 0;
    this.getBaseData();
  }
  getBaseNext() {
    this.noSqlEnv['skip'] = this.noSqlEnv['skip'] + this.noSqlEnv['range'];
    if (this.noSqlEnv['skip'] > this.noSqlEnv['rows']) this.noSqlEnv['skip'] = 0;
    this.getBaseData();
  }
  getBaseEnd() {
    this.noSqlEnv['skip'] = this.noSqlEnv['rows'] - 2;
    this.getBaseData();
  }
  // Add or edit data
  addBaseData() {
    this.navCtrl.push(dbEditDataPage);
  }
  editBaseData(item) {
    this.navCtrl.push(dbEditDataPage, item['doc']);
  }
  deleteBaseData(item, idx) {
    //console.log(item);
    this.couch.deleteDoc(this.noSqlEnv['base'], item['doc']['_rev'], item, this.params).then(response => {
      //this.baseItems.splice(idx, 1);
      this.getBaseData();
      let toast = this.toastCtrl.create({
        message: 'Enr. supprimé.',
        duration: 3000
      });
      toast.present();
    }, error => {
      console.log("ERR DELETE DATA", error);
      let toast = this.toastCtrl.create({
        message: 'Erreur de suppression',
        duration: 3000
      });
      toast.present();
    });;
  }
}
// ===== popover for database choice =====
@Component({
  selector: 'page-crud-base-detail',
  templateUrl: 'couch-crud-detail.html'
})
export class dbEditDataPage {
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
    console.log(this.aceEditor.getSession().getValue());
    try {
      let t = JSON.parse(this.aceEditor.getSession().getValue());
      this.events.publish("dataToSave", t);
      this.viewCtrl.dismiss();
    } catch (e) {
      console.log("JSON ERROR", e);
    }
  }
}
