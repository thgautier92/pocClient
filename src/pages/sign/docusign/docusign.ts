import { Component, ViewChild } from '@angular/core';
import { Platform, NavController, NavParams, Events, AlertController, LoadingController, ActionSheetController, Slides } from 'ionic-angular';
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
  @ViewChild(Slides) slides: Slides;
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
  envelopeDocuments: any = null;
  envelopeRecipients: any = null;
  clients: any = null;
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
  pdfSrc: any = null;
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
    this.docsModel = null;
    this.envelopeDocuments = null;
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
  goNext() {
    this.slides.slideNext()
  }
  goPrevious() {
    this.slides.slidePrev();
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
  getUseCaseRole() {
    if (this.signSend['useCase']) {
      let u = this.lstUseCase.filter(item => item['value']['name'] == this.signSend['useCase']);
      let usecase = u[0]['value']['dataUseCase'];
      console.log("UseCase selected", usecase);
      let map = usecase['mapping'];
    } else {
      return null;
    }
  }
  getClientsList() {
    if (this.signSend['useCase']) {
      let u = this.lstUseCase.filter(item => item['value']['name'] == this.signSend['useCase']);
      let usecase = u[0]['value']['dataUseCase'];
      this.clients = usecase['clients'];
      return this.clients;
    } else {
      return null;
    }
  }
  getClient(id) {
    if (this.clients) {
      let c = this.clients.filter(item => item['id'] == id);
      return c[0];
    } else {
      return null;
    }
  }
  changeRecipientClient(key, data, occurs, idx) {
    console.log(key, data, occurs, idx);
    let cli = this.getClient(occurs['recipientIdGuid']);
    console.log(cli);
    data[idx]['hostEmail'] = "thierry_gautier@groupe-sma.fr";
    data[idx]['hostName'] = '"Thierry GAUTIER (mode demo)';
    data[idx]['signerEmail'] = cli['email'];
    data[idx]['signerName'] = cli['cum_identite'];
  }
  //==================================================

  getDataTabs(cli, map, role) {
    console.log(cli, map, role);
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
    let tabs = { "textTabs": textTabs, "listTabs": listTabs, "checkboxTabs": checkTabs, "noteTabs": noteTabs };
    return tabs;
  }
  updateSignData() {
    //console.log("UseCase selected", this.signSend['useCase'], this.lstUseCase);
    let u = this.lstUseCase.filter(item => item['value']['name'] == this.signSend['useCase']);
    let usecase = u[0]['value']['dataUseCase'];
    let map = usecase['mapping'];
    //console.log("UseCase selected", usecase);
    //"templateId": this.signSend.docModel,
    //"templateRoles": [], "status": "sent",
    var dataSend = {
      "recipients": { "inPersonSigners": [] },
      "compositeTemplates": []
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
    dataSend['recipients']['inPersonSigners'] = tmp
    //dataSend['templateRoles'] = tmp;
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
  getDocInfo(item) {
    let loader = this.loadingCtrl.create({
      content: "Appel à DOCUSIGN : lecture des rôles en cours...",
      duration: 10000
    });
    let id = item.envelopeId;
    this.docuSign.getDocSignedData(id).then(data => {
      console.log(data);
    }, reason => {
      loader.dismiss();
      console.log('Failed: ' + JSON.stringify(reason));
    })
  }
  getDocSigned(item) {
    let loader = this.loadingCtrl.create({
      content: "Chargement des documents en cours...",
      duration: 10000
    });
    loader.present();
    //console.log(item);
    let id = item.envelopeId;
    this.docuSign.getDocSigned(id).then(data => {
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
  getDocSignedData(item) {
    let loader = this.loadingCtrl.create({
      content: "Appel à DOCUSIGN : lecture du document en cours...",
      duration: 10000
    });
    let id = item.envelopeId;
    this.dataDoc = {};
    this.docuSign.getDocSignedData(id).then(data => {
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
    console.log("Get models docs", this.signSend['docModel'])
    this.docsModel = [];
    this.signSend['docModel'].forEach(element => {
      //console.log(element);
      this.docuSign.getModelDocument(element).then(response => {
        console.log("Docs of model", response);
        this.docsModel.push(response);
      }, error => {
        console.error(error);
      });
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

  // ===== Create Envelopes and update ==============
  envelopCreateFromModels() {
    // Create the envelop with multi-model
    let loader = this.loadingCtrl.create({
      content: "Appel à DOCUSIGN : création de l'enveloppe à partir des modèles en cours...",
      duration: 10000
    });
    if (this.signSend['docModel']) {
      var dataSend = {
        "compositeTemplates": []
      };
      let idx = 1
      this.signSend['docModel'].forEach(element => {
        dataSend['compositeTemplates'].push({ "compositeTemplateId": "" + idx, "serverTemplates": [] });
        dataSend['compositeTemplates'][idx - 1]['serverTemplates'].push({ "sequence": "1", "templateId": element });
        idx = idx + 1;
      });
      this.signSend['models'] = dataSend;
      this.docuSign.sendSignEnv(dataSend).then(response => {
        //console.log(response);
        this.dataEnv = response;
        this.signSend['envId'] = response['envelopeId'];
        this.envelopGetData(response['envelopeId']);
        //console.log("Context data", this.signSend);
      }, function (reason) {
        console.log("Create Envelope error", reason);
      });
      loader.dismiss();
    } else {
      loader.dismiss();
      let alert = this.alertCtrl.create({
        title: 'Modèle de documents',
        subTitle: 'Veuillez choisir un à N modèles de document dans la liste',
        buttons: ["J'ai compris"]
      });
      alert.present();
    }
  }
  envelopAddData() {
    let loader = this.loadingCtrl.create({
      content: "Appel à DOCUSIGN : création de l'enveloppe en cours...",
      duration: 10000
    });
    console.log("DOC to create =>", this.signSend);
    if (this.signSend.docModel) {
      this.dataEnv = null;
      //this.signSend['data']['templateId'] = this.signSend.docModel;
      this.docuSign.sendSignEnv(this.signSend['data']).then(response => {
        //console.log(response);
        this.dataEnv = response;
        this.signSend['envId'] = response['envelopeId'];
        this.envelopGetData(response['envelopeId']);
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
  // Update envelope, Doc or Page
  envelopDocUpdate(envelopeId) {
    console.log("Modification des documents de l'enveloppe ", envelopeId);
    this.envelopeDocuments.forEach((element, index) => {
      //console.log("Supression du document ", element, index);
      if (element['order'] !== "1") {
        if (!element['select']) {
          // Supress the document from the enveloppe
          this.docuSign.removeDocFormEnv(envelopeId, index + 1).then(response => {
            //console.log(response);
            this.envelopGetData(envelopeId);
          }, reason => {
            console.log(reason);
          });
        }
      }
    });
  }
  envelopPageDocUpdate(envelopeId, docId, pageNumber) {
    console.log("Modification des documents de l'enveloppe ", envelopeId, docId, pageNumber);
    this.docuSign.removePageFormDocEnv(envelopeId, docId, pageNumber).then(response => {
      //console.log(response);
      this.envelopGetData(envelopeId);
    }, reason => {
      console.log(reason);
    });
  }
  envelopGetData(envelopeId) {
    let loader = this.loadingCtrl.create({
      content: "Lecture de l'enveloppe...",
    });
    loader.present();
    this.docuSign.getEnvelopeDocuments(envelopeId).then(response => {
      this.envelopeDocuments = response['envelopeDocuments'];
      this.envelopeDocuments.forEach(element => {
        element['pageSuppr'] = 0;
      });
      this.docuSign.getEnvelopeRecipients(envelopeId).then(response => {
        console.log("Destinataires", response);
        this.envelopeRecipients = response;
        let random = new Chance();
        let inPersonSigners = this.envelopeRecipients['inPersonSigners']
        inPersonSigners.forEach(element => {
          element['accessCode'] = random.natural({ min: 1, max: 9999 });
          element['recipientIdGuid'] = 0;
        });
        this.envelopeRecipients['inPersonSigners'] = inPersonSigners;
        loader.dismiss();
      }, reason => {
        console.log(reason);
        loader.dismiss();
      });
    }, reason => {
      console.log(reason);
      loader.dismiss();
    });
  }
  recipientDelete(key, idx) {
    console.log(this.envelopeRecipients[key]);
    this.envelopeRecipients[key].splice(idx, 1);
  }

  sendEnvelop() {
    // Update Recipients and Tabs Data from Use UseCase
    if (this.signSend['useCase']) {
      let u = this.lstUseCase.filter(item => item['value']['name'] == this.signSend['useCase']);
      let usecase = u[0]['value']['dataUseCase'];
      let process = usecase['process'];
      let map = usecase['mapping'];
      console.log(usecase, process);
      for (var dest in this.envelopeRecipients) {
        console.log("Add Tabs for ", dest, this.envelopeRecipients[dest]);
        let dataRecipient = this.envelopeRecipients[dest];
        if (Array.isArray(dataRecipient) && dataRecipient.length > 0) {
          dataRecipient.forEach(element => {
            //console.log(" ==>", element);
            let role = element['roleName'];
            console.log("  ==> Role ", role);
            let cliRef: number = element['recipientIdGuid'];
            if (cliRef > 0) {
              let cli = this.getClient(cliRef);
              console.log("  ==> refCli", cliRef, cli);
              let tabs = this.getDataTabs(cli, map, role);
              console.log("  ==> Tabs", tabs);
              element['tabs'] = tabs;
            }
          });
          this.envelopeRecipients[dest] = dataRecipient;
        }
      }
      console.log("Recipients updated ", this.envelopeRecipients);
      this.docuSign.updateRecipients(this.signSend['envId'], this.envelopeRecipients).then(response => {
        console.log(response);
      }, error => {
        console.log(error);
      })
    } else {
      let alert = this.alertCtrl.create({
        title: "Envoyer une enveloppe",
        subTitle: "Veuillez choisir des données métiers...",
        buttons: ["OK"]
      });
      alert.present();
    }


  }
  // =================================================

  // ===== Sign operations ===========================
  signBySender(item) {
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
        content: "Appel à DOCUSIGN : ouverture de la page de signature en cours...",
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
        //this.sendSign['urlSign'] = data['url'];
        this.winCtrl.openWin(data['url']);
        //win.location.href = data['url'];
      }, reason => {
        console.log('Failed: ' + JSON.stringify(reason));
        //win.document.body.innerHTML = "Erreur de préparation.<br>Veuillez fermer cet onglet.";
      })
      loader.dismiss();
    }
  };
  voidSignedDoc(envelopeId) {
    let loader = this.loadingCtrl.create({
      content: "Appel à DOCUSIGN : invalidation du document en cours...",
    });
    this.docuSign.voidDocEnv(envelopeId, null).then(data => {
      console.log(data);
      loader.dismiss();
    }, reason => {
      console.log('Failed: ', reason);
      loader.dismiss();
    })
  };
  refusedByClient(envelopeId) {
    let loader = this.loadingCtrl.create({
      content: "Appel à DOCUSIGN : refus de signature en cours...",
    });
    this.docuSign.voidDocEnv(envelopeId, null).then(data => {
      console.log(data);
      loader.dismiss();
    }, reason => {
      console.log('Failed: ', reason);
      loader.dismiss();
    })

  }
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
