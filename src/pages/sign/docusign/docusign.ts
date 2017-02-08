import { Component } from '@angular/core';
import { Platform, NavController, NavParams, Events, AlertController, LoadingController, ActionSheetController } from 'ionic-angular';
import { DocuSignModel } from './docusignmodel';
import { DocuSignServices } from '../../../providers/sign/docuSign';
import { CouchDbServices } from '../../../providers/couch/couch';
import { WinExternal } from '../../../providers/win-external';
import { PdfComponent } from '../../../components/pdf/pdf';
import { FilesOperation } from '../../../providers/files-operation';
declare var Chance: any;
/*
  Generated class for the Docusign page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/
@Component({
  selector: 'page-docusign',
  templateUrl: 'docusign.html'
})
export class Docusign {
  params: any;
  accountInfo: any;
  lstApi: any;
  signSend: any;
  signModel: any;
  lstModels: any;
  lstUseCase: any = [];
  lstUseCaseModel: any = [];
  saveModel: any;
  docsModel: any = null;
  option: any = "lstSign";
  lstEnvelopes: any = [];
  statusCode: any;
  dataAccount: any;
  dataEnv: any = null;
  dataDoc: any = null;
  docSended: any = null;
  dataFactures: any = null;
  defaultTextTab: any;
  display: any = { dataModel: false, generatorModel: false };
  constructor(public platform: Platform, public navCtrl: NavController, public navParams: NavParams,
    public events: Events, public alertCtrl: AlertController, public actionSheetCtrl: ActionSheetController,
    public loadingCtrl: LoadingController,
    public winCtrl: WinExternal,
    public fileOpe: FilesOperation,
    private docuSign: DocuSignServices, private couch: CouchDbServices) {

    this.saveModel = this.navParams.get('onSave');
    this.lstApi = [
      { "code": "lstSign", "title": "Historique des signatures", "method": "" },
      { "code": "sign", "title": "Signer un nouveau document", "method": "" },
      { "code": "detail", "title": "Détail", "method": "" },
      { "code": "factures", "title": "Facturation", "method": "" },
    ]
    this.statusCode =
      {
        "created": "crée",
        "deleted": "supprimée",
        "sent": "envoyée",
        "delivered": "livrée",
        "signed": "signée",
        "completed": "terminée",
        "declined": "refusée",
        "voided": "annulée",
        "timedout": "hors délai",
        "authoritativecopy": "copie autorisée",
        "transfercompleted": "transfert terminé",
        "template": "modèle",
        "correct": "correcte"
      };
    this.defaultTextTab = {
      "anchorString": null,
      "anchorXOffset": null,
      "anchorYOffset": null,
      "anchorIgnoreIfNotPresent": null,
      "anchorUnits": null,
      "anchorCaseSensitive": null,
      "anchorMatchWholeWord": null,
      "anchorHorizontalAlignment": null,
      "conditionalParentLabel": null,
      "conditionalParentValue": null,
      "customTabId": null,
      "documentId": "1",
      "maxLength": null,
      "pageNumber": "1",
      "recipientId": "1",
      "templateLocked": false,
      "templateRequired": false,
      "xPosition": "24",
      "yPosition": "153",
      "bold": false,
      "font": "arial",
      "fontColor": null,
      "fontSize": null,
      "italic": false,
      "tabLabel": "Data Field 13",
      "underline": false,
      "concealValueOnDocument": false,
      "disableAutoSize": false,
      "locked": false,
      "name": "Text",
      "required": true,
      "value": "",
      "width": 42,
      "requireAll": false,
      "requireInitialOnSharedChange": false,
      "senderRequired": false,
      "shared": false,
      "validationMessage": "",
      "validationPattern": "",
      "height": 11,
      "isPaymentAmount": false,
      "mergeField": {},
      "tabOrder": null
    }
  }
  ngOnInit() {
    this.signSend = {
      "useCase": "",
      "data": "",
      "docModel": "",
      "envId": ""
    };
    this.signModel = {
      "useCase": "",
      "docModel": "",
      "docModelFields": "",
    };
    this.couch.getParams().then(data => {
      console.log("Params", data);
      this.params = data;
      this.getUseCase();
    }).catch(error => {
      this.params = null;
      this.getUseCase();
    })
    this.getLstModel();
    this.dataDoc = { "default": true };
  }
  ionViewDidLoad() {
    console.log('Hello DocuSign Page');
  }
  presentActionSheet() {
    let actionSheet = this.actionSheetCtrl.create({
      title: 'Options DOCUSIGN',
      buttons: [
        {
          text: 'API Explorer',
          handler: () => {
            let url = "https://apiexplorer.docusign.com";
            window.open(url, '_blank');
          }
        },
        {
          text: 'Console administration',
          handler: () => {
            let url = "https://account-d.docusign.com/#/web/login";
            window.open(url, '_blank');
          }
        }, {
          text: 'Infos',
          handler: () => {
            this.getInfo();
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
  openModel() {
    this.navCtrl.push(DocuSignModel);
  }
  getInfo() {
    this.accountInfo = this.docuSign.getAccountInfo();
    let alert = this.alertCtrl.create({
      title: 'Informations confidentielles',
      subTitle: 'Compte de demo\n' + 'accountEmail=' + this.accountInfo['accountEmail'] + '\nintegratorKey=' + this.accountInfo['integratorKey'] + '\naccount=' + this.accountInfo['account'],
      buttons: ['OK']
    });
    alert.present();
  }
  // ===== Demo only =================================
  getUseCase() {
    this.couch.getDbViewDocs('poc_data', 'byType', 'sign', 100, 0, this.params).then(response => {
      //console.log(response);
      this.lstUseCase = response['rows'];
    }, error => {
      console.error(error);
    });
  }
  //==================================================
  updateSignData() {
    //console.log("UseCase selected", this.signSend['useCase'], this.lstUseCase);
    let u = this.lstUseCase.filter(item => item['value']['name'] == this.signSend['useCase']);
    let usecase = u[0]['value']['dataUseCase'];
    let map = usecase['mapping'];
    //console.log("UseCase selected", usecase);
    var dataSend = {
      "status": "sent",
      "templateId": this.signSend.docModel,
      "templateRoles": []
    };
    let tmp = [];
    for (var key in usecase['process']) {
      //console.log('Type: ' + typeof key);
      //console.log(key + ' => ' + usecase['process'][key]);
      let cli = usecase['clients'][usecase['process'][key]];
      //console.log(cli);
      let random = new Chance();
      let accessCode = random.natural({ min: 1, max: 9999 });
      // Create tabs
      let textTabs = [];
      let listTabs = [];
      let checkTabs = [];
      let noteTabs = [];
      for (var userKey in map) {
        let tbs = {};
        switch (map[userKey]) {
          case 'text':
            tbs = { "tabLabel": "text_" + userKey, "value": cli[userKey] }
            textTabs.push(tbs);
            break;
          case 'list':
            tbs = { "tabLabel": "list_" + userKey, "value": cli[userKey] }
            listTabs.push(tbs);
            break;
          case 'check':
            tbs = { "tabLabel": "check_" + userKey, "selected": cli[userKey] }
            checkTabs.push(tbs);
            break;
          case 'note':
            tbs = { "tabLabel": "note_" + userKey, "value": cli[userKey] }
            noteTabs.push(tbs);
            break;
          default:
        }
      }
      for (var docKey in usecase['varDocs']) {
        let tbs = { "tabLabel": "text_" + docKey, "value": usecase['varDocs'][docKey] }
        textTabs.push(tbs);
      }
      let tabs = { "textTabs": textTabs, "listTabs": listTabs, "checkboxTabs": checkTabs, "noteTabs": noteTabs };
      tmp.push({
        "accessCode": accessCode,
        "email": cli['email'],
        "name": cli['nom'],
        "inPersonSignerName": cli['nom'],
        "roleName": key,
        "clientUserId": cli['ref'],
        "tabs": tabs
      })
    }
    dataSend['templateRoles'] = tmp;
    this.signSend['data'] = dataSend;
  }
  // ===== Get documents info from the platform =====
  listEnvelopes(folder) {
    this.docuSign.getListEnv(2016, 1, folder).then(response => {
      //console.log(response);
      this.lstEnvelopes = response['folderItems'];
    }, error => {
      console.log("List Envelopes error", error);
    });
  }
  getDocSigned(item) {
    let loader = this.loadingCtrl.create({
      content: "Chargement des documents en cours...",
      duration: 10000
    });
    loader.present();
    //console.log(item);
    let id = item.envelopeId;
    this.docuSign.getdocSigned(id).then(data => {
      //console.log(data);
      if (this.platform.is('cordova')) {
        this.fileOpe.openDownloadedPdf(data).then(response => {

        }, error => {
          console.error(error);
          let alert = this.alertCtrl.create({
            title: 'Document signé',
            subTitle: "Erreur à l'ouverture du document : " + JSON.stringify(error),
            buttons: ['OK']
          });
          alert.present();
        })
        //window.location.href = url;
      } else {
        //window.open(url, '_blank');
        var file = new Blob([data], { type: 'application/pdf' });
        let pdfUrl = URL.createObjectURL(file);
        this.navCtrl.push(PdfComponent, pdfUrl);
        //this.winCtrl.openWin(pdfUrl);
      }
      loader.dismiss();
    }, reason => {
      console.log('Failed: ' + JSON.stringify(reason));
      //win.document.body.innerHTML = "Erreur de Chargement du document.<br>Veuillez fermer cet onglet.";
      loader.dismiss();
    })
  }
  getDocData(item) {
    let loader = this.loadingCtrl.create({
      content: "Appel à DOCUSIGN : lecture du document en cours...",
      duration: 10000
    });
    let id = item.envelopeId;
    this.dataDoc = {};
    this.docuSign.getdocSignedData(id).then(data => {
      //console.log(data);
      this.dataDoc['infoDoc'] = data;
      this.docuSign.getDocEvents(id).then(dataEvents => {
        //console.log(dataEvents);
        this.dataDoc['events'] = dataEvents;
        //console.log("Data for doc #", id, this.dataDoc);
        this.docuSign.getDocFromEnv(id).then(dataDocs => {
          //console.log(dataDocs);
          this.dataDoc['docs'] = dataDocs;
          //console.log("Data for doc #", id, this.dataDoc);
          this.option = "detail";
          loader.dismiss();
        }, reason => {
          loader.dismiss();
          console.log('Failed: ' + JSON.stringify(reason));
        })

      }, reason => {
        loader.dismiss();
        console.log('Failed: ' + JSON.stringify(reason));
      })
    }, reason => {
      loader.dismiss();
      console.log('Failed: ' + JSON.stringify(reason));
    })

  }
  // ================================================

  // ===== MODEL METHODS ============================
  getLstModel() {
    this.docuSign.getTemplates().then(response => {
      //console.log("Templates", response);
      this.lstModels = response;
    }, error => {
      console.log("Templates error", error);
    })
  }
  getModelDocs() {
    //console.log("Get models docs", this.signSend['docModel'])
    this.docuSign.getModelDocument(this.signSend['docModel']).then(response => {
      //console.log("Docs of model", response);
      this.docsModel = response['templateDocuments'];
    }, error => {
      console.error(error);
    });
  }
  loadModel() {
    let loader = this.loadingCtrl.create({ content: "Analyse du modèle.Veuillez patienter...", duration: 10000 });
    loader.present();
    //console.log(this.signSend['docModel']);
    this.docuSign.getModelDocument(this.signSend['docModel']).then(response => {
      //console.log(response);
      this.dataDoc['documents'] = response;
    }, error => {
      console.error(error);
    });
    this.docuSign.getModelProcess(this.signSend['docModel']).then(response => {
      this.dataDoc['signProcess'] = response;
      //console.log("=> Process", response);
      let lstFields = [];
      for (var d in response) {
        //console.log(response[d]);
        if (Array.isArray(response[d])) {
          for (var dd in response[d]) {
            //console.log("-->", response[d][dd]);
            let id = response[d][dd]['recipientId'];
            let role = response[d][dd]['roleName'];
            this.docuSign.getModelFields(this.signSend['docModel'], id).then(responseFields => {
              //console.log(responseFields)
              lstFields.push({ "recipientId": id, "roleName": role, "fields": responseFields });
            }, error => {
              console.error(error);
              loader.dismiss();
            });
          }
        }
      }
      this.dataDoc['fieldsByRole'] = lstFields;
      loader.dismiss();
    }, error => {
      console.error(error);
      loader.dismiss();
    });
  }
  getModelFields() {
    console.log(this.signModel);
    /*
    this.docuSign.getModelFields(this.signModel['templateId'], recipientId).then(response => {
      this.signModel['docModelFields'] = response;
    }, error => {
      console.error(error);
    });
    */
  }
  // ================================================

  // ===== Create Envelopes and sign ================
  sendSign() {
    let loader = this.loadingCtrl.create({
      content: "Appel à DOCUSIGN : création de l'enveloppe en cours...",
      duration: 10000
    });
    console.log("DOC", this.signSend);
    if (this.signSend.docModel) {
      this.dataEnv = null;
      this.signSend['data']['templateId'] = this.signSend.docModel;
      this.docuSign.sendSignEnv(this.signSend['data']).then(response => {
        //console.log(response);
        this.dataEnv = response;
        this.signSend['envId'] = response['envelopeId'];
        //console.log("Context data", this.signSend);
      }, function (reason) {
        console.log("Create Envelope error", reason);
      });
      loader.dismiss();
    } else {
      loader.dismiss();
      let alert = this.alertCtrl.create({
        title: 'Modèle de documents',
        subTitle: 'Veuillez choisir un modèle de document dans la liste',
        buttons: ["J'ai compris"]
      });
      alert.present();
    }
  };
  signDocUpdate(envelopeId) {
    console.log("Modification des documents de l'enveloppe ", envelopeId);
    this.docsModel.forEach((element, index) => {
      //console.log("Supression du document ", element, index);
      if (element['order'] !== "1") {
        if (!element['select']) {
          // Supress the document from the enveloppe
          this.docuSign.removeDocFormEnv(envelopeId, index + 1).then(response => {
            //console.log(response);
          }, reason => {
            console.log(reason);
          });
        }
      }
    });
  }
  signSender(item) {
    let loader = this.loadingCtrl.create({
      content: "Appel à DOCUSIGN : envoie des données de signature en cours...",
      duration: 10000
    });
    //let win = this.winCtrl.openWin('/assets/pages/loadingUrl.html');
    let id = item.envelopeId;
    var dataSend = {};
    this.docuSign.senderSignEnv(id, dataSend).then(data => {
      //console.log(data);
      //win.location.href = data['url'];
      this.winCtrl.openWin(data['url']);
    }, reason => {
      console.log('Failed: ' + JSON.stringify(reason));
      //win.document.body.innerHTML = "Erreur en erreur.<br>Veuillez fermer cet onglet.";
    })
    loader.dismiss();
  }
  signByClient(envelopeId, role) {
    if (envelopeId) {
      //let win = this.winCtrl.openWin('/assets/pages/loadingUrl.html');
      //{"authenticationMethod":"password","email":"doc.gautier@gmail.com","returnUrl":"http://gautiersa.fr/vie/docuSignReturn","userName":"doc.gautier@gmail.com"}
      let loader = this.loadingCtrl.create({
        content: "Appel à DOCUSIGN : ouverture de la page de signaturue en cours...",
        duration: 10000
      });
      var dataSend = {
        "email": role.email,
        "userName": role.name,
        "clientUserId": role.clientUserId,
        "returnUrl": "http://gautiersa.fr/vie/docuSignReturn.php",
        "authenticationMethod": "password"
      }
      console.log(envelopeId, dataSend);
      this.docuSign.destSignEnv(envelopeId, dataSend).then(data => {
        //console.log(data);
        this.sendSign['urlSign'] = data['url'];
        this.winCtrl.openWin(data['url']);
        //win.location.href = data['url'];
      }, reason => {
        console.log('Failed: ' + JSON.stringify(reason));
        //win.document.body.innerHTML = "Erreur de préparation.<br>Veuillez fermer cet onglet.";
      })
      loader.dismiss();
    }
  };
  // ================================================

  // ===== ACCOUNT METHODS ==========================
  infoAccount() {
    this.docuSign.getAccount().then(response => {
      //console.log(response);
      this.dataAccount = response;
    }, function (reason) {
      console.log("infoAccount error", reason)
    });
  };
  infoFacturation() {
    this.docuSign.getBilling().then(response => {
      this.dataFactures = response;
    }, error => {
      console.error(error);
    })
  }
  // ================================================
}
