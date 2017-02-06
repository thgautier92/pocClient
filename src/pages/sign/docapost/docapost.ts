import { Component } from '@angular/core';
import { NavController, NavParams, Events, AlertController, ActionSheetController } from 'ionic-angular';
import { DocapostServices } from '../../../providers/sign/docapost';
import { CouchDbServices } from '../../../providers/couch/couch';
import { UploadService } from '../../../providers/upload';
import { WinExternal } from '../../../providers/win-external';

declare var Chance: any;
/*
  Generated class for the Docapost page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/
@Component({
  selector: 'page-docapost',
  templateUrl: 'docapost.html'
})
export class Docapost {
  lstModels: any;
  lstApi: any;
  option: any = "modelSign";
  dataResult: any;
  dataHtml: any;
  lstUseCase: any = [];
  mapping: any = {};
  sendData: any = {};
  dataApi: any = null;
  displayData: boolean = false;
  percentProgress: any = 0;
  lstSignatory: any = [];
  metaData: any = [];
  msgProgress: any = [];
  constructor(public navCtrl: NavController, public navParams: NavParams, public events: Events,
    public alertCtrl: AlertController, public actionSheetCtrl: ActionSheetController,
    private upload: UploadService,
    public winCtrl: WinExternal,
    private docaPost: DocapostServices, private couch: CouchDbServices) {
    this.lstApi = [
      { "code": "modelSign", "title": "Signer un nouveau document", "method": "" },
      { "code": "oneSign", "title": "Signature à la pièce", "method": "" },
      { "code": "detail", "title": "Détail", "method": "" },
      { "code": "factures", "title": "Facturation", "method": "" },
    ]
    this.lstModels = [{ "modelId": "ED2c949e8b586dbfd0015871b5bd1c006f", "name": "Batiprojet" }];
    this.mapping = {
      "fieldNumber": "id",
      "profileNumber": "",
      "identityId": "",
      "civility": "",
      "lastname": "nom",
      "firstname": "prenom",
      "email": "",
      "phone": "",
      "address.street": "",
      "address.complements": "",
      "address.postalCode": "",
      "address.city": "",
      "address.country": "",
      "companyName": "",
      "companyRegistrationNumber": "",
      "entity": "",
      "role": "",
      "certCountryCode": "",
      "certOrgId": "",
      "signatureType": "",
      "withOtp": ""
    };
    this.metaData['participants'] = [];
  }
  ionViewDidLoad() {
    console.log('Hello Docapost Page');
  }
  ngOnInit() {
    this.sendData = {
      "id": "",
      "status": null,
      "files": null,
      "fileSend": null,
      "useCase": null,
      "model": "",
      "metaData": null,
      "doc": null
    };
    this.getUseCase();
  }
  presentActionSheet() {
    let actionSheet = this.actionSheetCtrl.create({
      title: 'Options DOCAPOST',
      buttons: [
        {
          text: 'API',
          handler: () => {
            let url = "https://test.contralia.fr/Contralia/doc/presentation/documentationgenerale";
            window.open(url, '_system');
          }
        }, {
          text: 'Console administration',
          handler: () => {
            let url = "https://test.contralia.fr/Contralia";
            window.open(url, '_system');
          }
        }, {
          text: 'Editeur de modèle EDoc',
          handler: () => {
            let url = "https://test.contralia.fr/eDoc";
            window.open(url, '_system');
          }
        }
        , {
          text: 'Infos',
          handler: () => {
            //this.getInfo();
          }
        }, {
          text: 'Fermer',
          role: 'cancel',
          handler: () => {
          }
        }
      ]
    });
    actionSheet.present();
  }
  initTransaction() {
    this.docaPost.init().then(response => {
      //console.log(response);
      this.sendData['id'] = response['transaction']['$']['id']
    }, error => {
      console.error(error);
    })
  }
  getStatus() {
    this.docaPost.status(this.sendData['id']).then(response => {
      //console.log(response);
      this.sendData['status'] = response;
      this.dataApi = response;
      this.displayData = true;
    }, error => {
      console.error(error);
      this.dataApi = error;
      this.displayData = true;
    })
  }
  selectFile($event): void {
    var inputValue = $event.target;
    var files = $event.srcElement.files
    this.sendData['files'] = files;
    let file = inputValue.files[0];
    console.log("Input File name: " + file.name + " type:" + file.type + " size:" + file.size);
  }
  sendDoc() {
    this.docaPost.getObserver()
      .subscribe(progress => {
        this.percentProgress = progress;
      });
    this.docaPost.sendFile(this.sendData['id'], this.sendData['files']).subscribe((data) => {
      console.log(data);
      this.sendData['fileSend'] = data['document'];
    });
  }
  addSignatory(item) {
    this.docaPost.addSignatory(this.sendData['id'], 0, item).then(response => {
      //console.log(response);
      item['sign'] = response['signature']['$'];
    }, error => {
      console.error(error);
    })
  }
  getUseCase() {
    this.couch.getDbViewDocs('poc_data', 'byType', 'sign', 100, 0).then(response => {
      //console.log(response);
      this.lstUseCase = response['rows'];
    }, error => {
      console.error(error);
    });
  }
  // Génération des données pour le document à la piece
  updateSignData() {
    let u = this.lstUseCase.filter(item => item['value']['name'] == this.sendData['useCase']);
    let usecase = u[0]['value']['dataUseCase'];
    //console.log("UseCase selected", usecase);
    this.lstSignatory = [];
    let idx = 0;
    for (var key in usecase['process']) {
      let cli = usecase['clients'][usecase['process'][key]];
      //Mapping between usecase and api
      let tmp = {};
      for (var keyMap in this.mapping) {
        //console.log(keyMap, this.mapping[keyMap]);
        if (this.mapping[keyMap] != "") {
          tmp[keyMap] = cli[this.mapping[keyMap]];
        } else {
          tmp[keyMap] = '';
        }
      }
      tmp['id'] = this.sendData['id'];
      tmp["position"] = idx;
      tmp["format"] = "xml";
      tmp["sign"] = null;
      this.lstSignatory.push(tmp);
      idx++;
      //console.log(cli);
    }
  }
  // Edoc interaction
  updateSignModel() {
    /* jsonMetadata
        {
      "participants": [
        {"number":"1", "name":"Participant1", "clientRef":"ID111"}, 
        {"number":"2", "name":"Participant2", "clientRef":"ID222"}], 
        
      "fields":[
        {"participantNumber":"0", "description": "Desc0", "type":"TEXT", "name":"Field0", "page":1, "x":"200", "y":"500", "width":"50", "height":"30", fontSize="12", "required":"true", "values":"v0a,v0b"},
        {"participantNumber":"1", "description": "Desc1", "type":"TEXT", "name":"Field1", "page":1, "x":"200", "y":"600", "width":"50", "height":"30", fontSize="12", "required":"false", "values":"v1a,v1b"},
        {"participantNumber":"2", "description": "Desc2", "type":"TEXT", "name":"Field2", "xy":"{searchText}+5", "width":"50", "height":"30", fontSize="12", "values":"v2a,v2b"}],
            
      "values": [
        {"fieldName":"Field0", "value":"Value0"}, 
        {"fieldName":"Field1", "value":"Value1"}, 
        {"fieldName":"Field2", "value":"Value2"}]
    }
    */
    let u = this.lstUseCase.filter(item => item['value']['name'] == this.sendData['useCase']);
    let usecase = u[0]['value']['dataUseCase'];
    //console.log("UseCase selected", usecase);
    this.metaData = {};
    let idx = 0;
    let participants = []
    let fieldsDef = [];
    let fieldValues = [];
    for (var key in usecase['process']) {
      let cli = usecase['clients'][usecase['process'][key]];
      // create participants
      participants.push({ "number": idx, "name": "Participant " + (idx + 1), "clientRef": cli['id'] });
      //create fields
      for (var userKey in cli) {
        let tbs = { "participantNumber": idx, "name": "texte_" + userKey, "value": cli[userKey] }
        let tbsV = { "fieldName": "texte_" + userKey, "value": cli[userKey] }
        fieldsDef.push(tbs);
        fieldValues.push(tbsV);
      }
      for (var docKey in usecase['varDocs']) {
        let tbs = { "participantNumber": idx, "name": "texte_" + userKey, "value": cli[userKey] }
        let tbsV = { "fieldName": "texte_" + docKey, "value": usecase['varDocs'][docKey] }
        fieldsDef.push(tbs);
        fieldValues.push(tbsV);
      }
      idx++;
      //console.log(cli);
    }
    //this.metaData = { "participants": participants, "fields": fieldsDef, "values": fieldValues };
    this.metaData = { "participants": participants, "values": fieldValues };
    this.sendData['metaData'] = this.metaData;
  }
  createDoc() {
    // Create doc and Fill fields
    this.docaPost.createDoc(this.sendData['model'], "Doc de test", this.metaData).then(response => {
      //console.log(response);
      this.sendData['doc'] = response['document']['$'];
    }, error => {
      console.error(error);
    })
  }
  signDoc() {
    if (typeof this.sendData['doc'] === 'undefined' || !this.sendData['doc']) {

    } else {
      this.docaPost.getObserver()
        .subscribe(progress => {
          this.percentProgress = progress;
        });
      this.msgProgress = [];
      this.msgProgress.push("Création de la transaction");
      this.docaPost.init().then(response => {
        this.sendData['id'] = response['transaction']['$']['id'];
        let idDoc = this.sendData['doc']['id'];
        // Associate Doc to transaction
        this.msgProgress.push("Téléchargement du document rempli");
        this.docaPost.getPdf(idDoc).then(pdf => {
          console.log(pdf);
          //console.log("type file pdf", typeof (pdf));
          this.msgProgress.push("Association de la transaction et du document");
          this.docaPost.attachPdfToTransaction(this.sendData['id'], pdf, "Signature").subscribe((data) => {
            //console.log(data);
            this.sendData['fileSend'] = data['document'];
            this.msgProgress.push("Association des signataires du document");
            this.lstSignatory.forEach(item => {
              this.addSignatory(item);
            });
            console.log('SendData', this.sendData);
            this.msgProgress.push("Lancement du processus de signature");
            this.sendSign();
          });
        }, error => {
          console.error(error);
        })
      }, error => {
        console.error(error);
      })
    }
  }
  sendSign() {
    //let win = this.winCtrl.openWin('/assets/pages/loadingUrl.html');
    this.docaPost.getsignUrl(this.sendData['id']).then(response => {
      //console.log(response);
      let url = response['url'];
      this.winCtrl.openWin(url);
      //win.location.href = url;
    }, error => {
      console.error(error);
    })
  }

}
