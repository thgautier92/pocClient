import { Component, ViewChild } from '@angular/core';
import { Platform, NavController, NavParams, Events, AlertController, LoadingController, ActionSheetController, Slides, PopoverController, ViewController, ToastController } from 'ionic-angular';
import { DocuSignModel } from './docusignmodel';
import { DocuSignServices } from '../../../providers/sign/docuSign';
import { CouchDbServices } from '../../../providers/couch/couch';
import { WinExternal } from '../../../providers/win-external';
import { PdfComponent } from '../../../components/pdf/pdf';
import { FilesOperation } from '../../../providers/files-operation';
//Pipes
import { groupBy, sortBy } from '../../../pipes/comon';
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
  modeDemo: boolean = false;
  folderFilter: any = null;
  params: any;
  accountInfo: any;
  lstApi: any;
  signSend: any;
  signModel: any;
  lstModels: any = null;;
  lstUseCase: any = [];
  lstUseCaseModel: any = [];
  saveModel: any;
  docsModel: any = null;
  envelopeDocuments: any = null;
  envelopeRecipients: any = null;
  envelopeRecipientsToDelete: any = null;
  envelopeRecipientsSent: any = null;
  adhesion: any = null;
  clients: any = null;
  conseiller: any = null;
  selClient: any = null;
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
    public popoverCtrl: PopoverController,
    public toastCtrl: ToastController,
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
        "correct": "correcte",
        "signers": "Doit signer",
        "inPersonSigners": "Signataire en personne",
        "carbonCopies": "Recoie une copie",
        "agents": "Doit consulter",
        "certifiedDeliveries": "Définit les destinataires",
        "editors": "Autoriser à modifier",
        "intermediaries": "Mettre à jour les destinataires",

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
    this.changeModeDemo();
    this.docsModel = null;
    this.envelopeDocuments = null;
    this.signSend = {
      "useCase": "",
      "data": "",
      "docModel": "",
      "envId": "",
      "envData": null
    };
    this.signModel = {
      "useCase": "",
      "docModel": "",
      "docModelFields": "",
    };
    this.couch.getParams().then(data => {
      //console.log("Params", data);
      this.params = data;
      this.getUseCase();
    }).catch(error => {
      this.params = null;
      this.getUseCase();
    })
    this.getLstModel();
    this.dataDoc = { "default": true };
    this.docsModel = null;
    this.envelopeDocuments = null;
    this.envelopeRecipients = null;
    this.envelopeRecipientsSent = null;
    this.adhesion = null;
    this.clients = null;
    this.conseiller = null;
    this.selClient = null;
    this.envelopeRecipientsToDelete = null;
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
          icon: 'construct',
          handler: () => {
            let url = "https://apiexplorer.docusign.com";
            window.open(url, '_blank');
          }
        },
        {
          text: 'Console administration',
          icon: 'cloud-circle',
          handler: () => {
            let url = "https://account-d.docusign.com/#/web/login";
            window.open(url, '_blank');
          }
        }, {
          text: 'Infos',
          icon: 'information-circle',
          handler: () => {
            this.getInfo();
          }
        }, {
          text: 'Mode demo SMAVie Mobilité',
          icon: (this.modeDemo ? 'checkbox-outline' : 'color-wand'),
          handler: () => {
            this.changeModeDemo();
          }
        },
        {
          text: 'Fermer',
          role: 'cancel',
          handler: () => {
          }
        }
      ]
    });
    actionSheet.present();
  }
  changeModeDemo() {
    this.modeDemo = !this.modeDemo;
    if (this.modeDemo) {
      this.folderFilter = 'Templates';
    } else {
      this.folderFilter = null;
    }
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
  // ===== Demo only - Method for ======================
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
      //let map = usecase['mapping'];
    } else {
      return null;
    }
  }
  getClientsList() {
    if (this.signSend['useCase']) {
      let u = this.lstUseCase.filter(item => item['value']['name'] == this.signSend['useCase']);
      let usecase = u[0]['value']['dataUseCase'];
      this.conseiller = usecase['conseiller'];
      this.clients = usecase['clients'];
      this.adhesion = usecase['adhesion'];
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

  //==================================================
  getEnvelopeProcess(envelopeId) {
    let loader = this.loadingCtrl.create({
      content: "Appel à DOCUSIGN : Lecture des destinataires et des données associées..."
    });
    loader.present();
    this.getAllRecipientsWithTabs(envelopeId).then(response => {
      console.info(response);
      loader.dismiss();
    }, error => {
      console.error(error);
      loader.dismiss();
    })
  }
  getAllRecipientsWithTabs(envelopeId) {
    return new Promise((resolve, reject) => {
      let datas = [];
      this.docuSign.getEnvelopeRecipients(envelopeId).then(lst => {
        //console.log(lst);
        let recipientCount: number = lst["recipientCount"];
        for (var dest in lst) {
          let recipient = lst[dest];
          if (Array.isArray(recipient) && recipient.length > 0) {
            recipient.forEach(element => {
              element['note'] = dest;
              this.docuSign.getEnvelopeTabs(envelopeId, element['recipientId']).then(tabsData => {
                //console.log(tabsData);
                element['tabs'] = tabsData;
                datas.push(element);
                if (datas.length >= recipientCount) {
                  resolve(datas);
                }
              }, tabsError => {
                console.error("==> Error reading TABs from evelop ", envelopeId, " for recipient ", element['recipientId'], tabsError);
                reject(tabsError);
              })
            });
          }
        }
      }, lstError => {
        reject(lstError);
      })
    });
  }
  changeRecipientClient(idx) {
    let popover = this.popoverCtrl.create(SelectDataPage, { "title": "Choisir un client", "items": this.clients, "idx": idx });
    popover.present();
    this.events.subscribe("SelectedData", response => {
      //Read Use case data
      let u = this.lstUseCase.filter(item => item['value']['name'] == this.signSend['useCase']);
      let usecase = u[0]['value']['dataUseCase'];
      let adh = usecase['adhesion'];
      //Read Client selection 
      let cli = response['data'];
      let i = response['idx'];
      this.envelopeRecipients[i]['recipientIdGuid'] = cli['id'];
      if (this.envelopeRecipients[i]['note'] == "inPersonSigners") {
        this.envelopeRecipients[i]['signerEmail'] = cli['email'];
        this.envelopeRecipients[i]['signerName'] = cli['cum_identite'];
        this.envelopeRecipients[i]['hostEmail'] = this.conseiller['email'];
        this.envelopeRecipients[i]['hostName'] = this.conseiller['name'];
      } else {
        this.envelopeRecipients[i]['email'] = cli['email'];
        this.envelopeRecipients[i]['name'] = cli['cum_identite'];
      }
      // Update Tabs data
      let tabsData = this.envelopeRecipients[i]['tabs'];
      for (var typeSign in tabsData) {
        //console.log("Update data for ", typeSign);
        for (var typeTab in tabsData[typeSign]) {
          //console.log("Update data for tab ", typeTab, tabsData[typeSign][typeTab]);
          let fl = tabsData[typeSign][typeTab]['tabLabel'];
          let f = fl.substring(fl.indexOf("_") + 1)
          if (adh[f]) {
            tabsData[typeSign][typeTab]['value'] = adh[f];
          }
        }
      }
      this.envelopeRecipients[i]['tabs'] = tabsData;
      //console.info("New value", this.envelopeRecipients);
    });
  }
  // =================================================
  // ===== Get documents info from the platform =====
  listEnvelopes(folder) {
    let loader = this.loadingCtrl.create({
      content: "Appel à DOCUSIGN : Liste des enveloppes...",
      duration: 10000
    });
    loader.present();
    this.lstEnvelopes = null;
    this.docuSign.getListEnv(2017, 2, folder).then(response => {
      console.log(response);
      this.lstEnvelopes = response['folderItems'];
      loader.dismiss();
    }, error => {
      console.log("List Envelopes error", error);
      loader.dismiss();
    });
  }
  getDocSigned(envelopeId) {
    let loader = this.loadingCtrl.create({
      content: "Chargement des documents en cours...",
      duration: 20000
    });
    loader.present();
    this.docuSign.getDocSigned(envelopeId).then(data => {
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
  getDocSignedData(id) {
    let loader = this.loadingCtrl.create({
      content: "Appel à DOCUSIGN : lecture des données du document en cours...",
      duration: 10000
    });
    loader.present();
    this.dataDoc = {};
    this.docuSign.getDocSignedData(id).then(data => {
      console.log(data);
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
      console.log("Templates", response);
      this.lstModels = response;
    }, error => {
      console.log("Templates error", error);
    })
  }
  getModelDocs() {
    console.log("Get models docs", this.signSend['docModel'])
    this.docsModel = [];
    this.envelopeRecipientsToDelete = null;
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
    if (this.signSend['docModel']) {
      let loader = this.loadingCtrl.create({
        content: "Appel à DOCUSIGN : création de l'enveloppe à partir des modèles...",
        duration: 10000
      });
      loader.present();
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
        loader.dismiss();
      }, function (reason) {
        loader.dismiss();
        let toast = this.toastCtrl.create({
          message: "Erreur à la création de l'enveloppe : " + reason,
          duration: 3000,
          position: "bottom"
        });
        toast.present();
        console.log("Create Envelope error", reason);
      });
    } else {
      let alert = this.alertCtrl.create({
        title: 'Modèle de documents',
        subTitle: 'Veuillez choisir un à N modèles de document dans la liste',
        buttons: ["J'ai compris"]
      });
      alert.present();
    }
  }
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
      content: "Lecture des destinataires de l'enveloppe...",
    });
    loader.present();
    this.docuSign.getEnvelopeDocuments(envelopeId).then(response => {
      this.envelopeDocuments = response['envelopeDocuments'];
      this.envelopeDocuments.forEach(element => {
        element['pageSuppr'] = 0;
      });
      this.envelopeRecipients = null;
      this.getAllRecipientsWithTabs(envelopeId).then(response => {
        console.log(response);
        this.envelopeRecipients = response;
        this.envelopeRecipients.forEach(element => {
          let random = new Chance();
          element['accessCode'] = random.natural({ min: 1, max: 9999 });
          element['recipientIdGuid'] = 0;
          if (element['roleName'] == "CONSEILLER") {
            element['name'] = this.conseiller['name'];
            element['email'] = this.conseiller['email'];
          }
        });
        loader.dismiss();
        console.log("==> Destinataires", this.envelopeRecipients)
      }, error => {
        console.log(error);
        loader.dismiss();

      })
    }, reason => {
      console.log(reason);
      loader.dismiss();
    });
  }
  recipientDelete(key, idx) {
    console.log(this.envelopeRecipients[key]);
    this.envelopeRecipients[key].splice(idx, 1);
    this.envelopeRecipientsToDelete.push(this.envelopeRecipients[key][idx]);
  }
  envelopeReorderProcess(envelopId, recipients) {
    let loader = this.loadingCtrl.create({
      content: "Appel à DOCUSIGN : Mise à jour du processus de signature...",
      duration: 10000
    });
    console.log("Sort RECIPIENTS", recipients);
    let exception = "recipientCount,currentRoutingOrder";
    let so = [];
    //let so = new sortBy().transform(recipients, 'routingOrder');
    for (let key in recipients) {
      if (!exception.includes(key)) {
        for (let rc of recipients[key]) {
          rc['type'] = key;
          so.push(rc);
        }
      }
    }
    so = new sortBy().transform(so, 'signerName');
    for (let i = 0; i < so.length; i++) {
      so[i]["routingOrder"] = (i + 1).toString();
    }
    let ret = new groupBy().transform(so, "type");
    console.log("RECIPIENTS SORT", ret);
    this.docuSign.updateRecipients(envelopId, ret).then(response => {
      console.log(response);
      loader.dismiss();
      let toast = this.toastCtrl.create({
        message: "Processus de signature mise à jour",
        duration: 3000,
        position: "bottom"
      });
      toast.present();
    }, error => {
      loader.dismiss();
      let toast = this.toastCtrl.create({
        message: "Erreur à la mise à jour du processus : ",
        duration: 3000,
        position: "bottom"
      });
      toast.present();
      console.log(error);
    })
  }

  // ==========================================================
  // Methods for updating Recipients informations and data tabs
  updateRecipientEnvelop() {
    // Update Recipients from Used UseCase
    if (this.signSend['useCase']) {
      console.log("Recipients to update ", this.envelopeRecipients);
      let loader = this.loadingCtrl.create({
        content: "Appel à DOCUSIGN : Mise à jour des destinataires de l'enveloppe...",
      });
      loader.present();
      // ===== Update TABS data =====
      this.nextUpdateRecipientTabs(-1);
      this.events.subscribe("AllTabsUptdated", response => {
        // Prepare data for update recipient informations
        let data = {};
        this.envelopeRecipients.forEach(element => {
          delete element['tabs'];
          data[element['note']] = [];
        });
        this.envelopeRecipients.forEach(element => {
          data[element['note']].push(element);
        });
        console.log("Mise à jour des destinataires", data);
        this.docuSign.updateRecipients(this.signSend['envId'], data).then(response => {
          console.log(response);
          loader.dismiss();
          let toast = this.toastCtrl.create({
            message: "Destinataires de l'Enveloppe mise à jour",
            duration: 3000,
            position: "bottom"
          });
          toast.present();
        }, error => {
          loader.dismiss();
          let toast = this.toastCtrl.create({
            message: "Erreur à la mise à jour de l'enveloppe : ",
            duration: 3000,
            position: "bottom"
          });
          toast.present();
          console.log(error);
        })
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
  nextUpdateRecipientTabs(idx) {
    idx = idx + 1;
    if (this.envelopeRecipients.length > idx) {
      //console.log("RECIPIENT", idx, this.envelopeRecipients[idx]);
      let tabs = this.envelopeRecipients[idx]['tabs'];
      let i = this.envelopeRecipients[idx]['recipientId'];
      this.updateRecipientTabs(idx, i, tabs);
    } else {
      console.log("UPDATE FINISHED");
      this.events.publish("AllTabsUptdated", true);
    }
  }
  updateRecipientTabs(idx, recipientId, tabs) {
    this.docuSign.updateEnvelopeTabs(this.signSend['envId'], recipientId, tabs).then(response => {
      //console.log(response);
      this.nextUpdateRecipientTabs(idx);
    }, error => {
      console.error(error);
    })
  }
  // ==========================================================


  sendEnvelop() {
    let loader = this.loadingCtrl.create({
      content: "Appel à DOCUSIGN : Envoi de l'enveloppe...",
      duration: 10000
    });
    loader.present();
    this.docuSign.sendEnv(this.signSend['envId']).then(response => {
      console.log(response);
      loader.dismiss();
      let toast = this.toastCtrl.create({
        message: "Enveloppe envoyée pour signature",
        duration: 3000,
        position: "bottom"
      });
      toast.present();
      this.envelopGetRecipientSent(this.signSend['envId']);
      this.docuSign.getEnvelope(this.signSend['envId']).then(env => {
        console.log("Enveloppe", env);
        this.dataEnv = env;
      }, error => {
        console.log(error);
      })
    }, error => {
      loader.dismiss();
      let alert = this.alertCtrl.create({
        title: "Erreur lors de l'envoi de l'enveloppe",
        subTitle: error['_body']['errorCode'],
        message: error['_body']['message'],
        buttons: ["J'ai compris."]
      });
      alert.present();
      console.log(error);
    })
  }
  envelopGetRecipientSent(envelopeId) {
    let loader = this.loadingCtrl.create({
      content: "Lecture des destinataires de l'enveloppe...",
    });
    loader.present();
    this.docuSign.getEnvelopeRecipients(envelopeId).then(response => {
      console.log("Destinataires", response);
      this.envelopeRecipientsSent = response;
      loader.dismiss();
    }, reason => {
      console.log(reason);
      loader.dismiss();
    });
  }
  // =================================================

  // ===== Sign operations ===========================
  signBySender(envelopeId) {
    let loader = this.loadingCtrl.create({
      content: "Appel à DOCUSIGN : envoie des données de signature en cours...",
      duration: 10000
    });
    //let win = this.winCtrl.openWin('/assets/pages/loadingUrl.html');
    var dataSend = {};
    this.docuSign.senderSignEnv(envelopeId, dataSend).then(data => {
      //console.log(data);
      //win.location.href = data['url'];
      this.winCtrl.openWin(data['url']);
    }, reason => {
      console.log('Failed: ' + JSON.stringify(reason));
      //win.document.body.innerHTML = "Erreur en erreur.<br>Veuillez fermer cet onglet.";
    })
    loader.dismiss();
  }
  signByClient(envelopeId, recipient, data) {
    console.log(data);
    if (envelopeId) {
      //let win = this.winCtrl.openWin('/assets/pages/loadingUrl.html');
      //{"authenticationMethod":"password","email":"doc.gautier@gmail.com","returnUrl":"http://gautiersa.fr/vie/docuSignReturn","userName":"doc.gautier@gmail.com"}
      let loader = this.loadingCtrl.create({
        content: "Appel à DOCUSIGN : ouverture de la page de signature en cours...",
        duration: 10000
      });
      let dataSend = null;
      //"clientUserId": data.userId,
      if (recipient == 'inPersonSigners') {
        dataSend = {
          "email": data['hostEmail'],
          "userName": data['hostName'],
          "returnUrl": "http://gautiersa.fr/vie/docuSignReturn.php",
          "authenticationMethod": "password"
        }
      } else {
        dataSend = {
          "email": data.email,
          "userName": data.name,
          "returnUrl": "http://gautiersa.fr/vie/docuSignReturn.php",
          "authenticationMethod": "password"
        }
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
  refusedByClient(envelopeId, refusData) {
    let loader = this.loadingCtrl.create({
      content: "Appel à DOCUSIGN : refus de signature en cours...",
    });
    loader.present();
    refusData['declinedReason'] = "Signature papier"
    refusData['declinedDateTime'] = new Date();
    console.log(refusData);
    this.docuSign.updateRecipients(envelopeId, refusData).then(response => {
      console.log(response);
      loader.dismiss();
      let toast = this.toastCtrl.create({
        message: "Destinataires de l'Enveloppe mise à jour",
        duration: 3000,
        position: "bottom"
      });
      toast.present();
    }, error => {
      loader.dismiss();
      let toast = this.toastCtrl.create({
        message: "Erreur à la mise à jour de l'enveloppe : ",
        duration: 3000,
        position: "bottom"
      });
      toast.present();
      console.log(error);
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


/* ===================================================
  Class for the Docusign Client select page.
  Display as POPOVER.
  ====================================================
*/
@Component({
  template: `
    <ion-list>
      <ion-list-header>{{title}}</ion-list-header>
      <ion-item *ngFor="let item of items" (click)="selItem(item)">{{item.cum_identite}}</ion-item>
    </ion-list>
    <button ion-button (click)="cancelItem()">Annuler</button>
     `
})
export class SelectDataPage {
  items: any;
  title: any = "Veuillez choisir un element";
  idx: any = null;
  key: any = null;
  constructor(private navParams: NavParams, private viewCtrl: ViewController, private events: Events) { }
  ngOnInit() {
    console.log("Welcome to SelectDataPage");
    if (this.navParams.data) {
      this.items = this.navParams.data['items'];
      this.title = this.navParams.data['title'];
      this.idx = this.navParams.data['idx'];
    }
  }
  selItem(item) {
    this.events.publish("SelectedData", { "idx": this.idx, "data": item });
    this.viewCtrl.dismiss();
  }
  cancelItem() {
    this.viewCtrl.dismiss();
  }
}