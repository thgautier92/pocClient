import { Component, ViewChild } from '@angular/core';
import { Platform, NavController, NavParams, Events, AlertController, LoadingController, ActionSheetController, Slides, PopoverController, ViewController, ToastController } from 'ionic-angular';
import { DocuSignServices } from '../../../providers/sign/docuSign';
import { CouchDbServices } from '../../../providers/couch/couch';
import { WinExternal } from '../../../providers/win-external';
import { PdfComponent } from '../../../components/pdf/pdf';
import { FilesOperation } from '../../../providers/files-operation';
//Pipes
import { groupBy, sortBy } from '../../../pipes/comon';
declare var Chance: any;
/*
  Generated class for the SmavieMobilite page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/
@Component({
  selector: 'page-smavie-mobilite',
  templateUrl: 'smavie-mobilite.html'
})
export class SmavieMobilitePage {
  @ViewChild(Slides) slides: Slides;
  params: any = null;                 // Paramétres de connexion à COUCHDB
  statusCode: any = null              // Liste des status d'enveloppes, traduction incluse
  signSend: any = null;               // Structure de stockage des données anvoyées à la signature
  // ===== Variables de stockage des information de l'adhesion =====
  folderFilter: any = null            // Varriable de filtre des templates disponibles
  lstUseCase: any = null              // Liste des cas d'usage : demo
  clients: any = null;                // Liste des clients
  conseiller: any = null              // Conseiller connécté
  adhesion: any = null;               // Données de l'adhésion
  process: any = null;                // Processus d'adhesion

  lstModels: any = null               // Liste des modèles de signature DocuSign
  docsModel: any = null               // Liste des documents contenus dans le(s) modèle(s)
  envelopeRecipients: any = null      // Liste des destinataires de l'enveloppe
  envelopeRecipientsSent: any = null   // Liste des informations envoyés en signature
  // Tableau des messages d'avancement de la signature
  msg: Array<{ step: string, msg: string, dt: Date, status: string }>;

  constructor(public platform: Platform, public navCtrl: NavController, public navParams: NavParams,
    public events: Events, public alertCtrl: AlertController, public actionSheetCtrl: ActionSheetController,
    public loadingCtrl: LoadingController,
    public winCtrl: WinExternal,
    public fileOpe: FilesOperation,
    public popoverCtrl: PopoverController,
    public toastCtrl: ToastController,
    private docuSign: DocuSignServices, private couch: CouchDbServices) {
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
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad SmavieMobilitePage');
  }
  ngOnInit() {
    this.signSend = {
      "useCase": null,
      "data": null,
      "docModel": null,
      "envelopeId": null,
      "envelopeData": null
    };
    this.msg = null;
    this.clients = null;
    this.conseiller = null;
    this.folderFilter = 'Templates';
    this.couch.getParams().then(data => {
      this.params = data;
      this.getUseCase();
    }).catch(error => {
      this.params = null;
      this.getUseCase();
    })
    this.getLstModel();
  };
  goNext() {
    this.slides.slideNext()
  }
  goPrevious() {
    this.slides.slidePrev();
  }
  goNew() {
    this.slides.slideTo(0);
    this.ngOnInit();
  }

  // ===== Only for proto datas ======
  getUseCase() {
    this.couch.getDbViewDocs('poc_data', 'byType', 'sign', 100, 0, this.params).then(response => {
      this.lstUseCase = response['rows'];
    }, error => {
      console.error(error);
    });
  }
  getUseCaseDetail() {
    if (this.signSend['useCase']) {
      let u = this.lstUseCase.filter(item => item['value']['name'] == this.signSend['useCase']);
      let usecase = u[0]['value']['dataUseCase'];
      this.conseiller = usecase['conseiller'];
      this.clients = usecase['clients'];
      this.adhesion = usecase['adhesion'];
      this.process = usecase['process'];
    } else {
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
  // ====== Dousign Operations =======
  getLstModel() {
    this.docuSign.getTemplates().then(response => {
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


  /* ====== Etapes pour l'envoi de l'enveloppe =====
    1. Création de l'enveloppe à partir des modèles
    2. Supression des pages inutiles
    3. Affectation des données aux rôles
    4. Affectation des personnes aux rôles
  ==================================================*/
  sendEnvelop() {
    this.msg = [];
    if (this.signSend['docModel']) {
      this.msg.push({ step: "create", msg: "Création de l'enveloppe à partir des modèles", dt: new Date(), status: "En cours" })
      this.envelopCreateFromModels().then(response => {
        //this.envelopUpdatePages();
        this.msg[this.msg.length - 1].status = "Terminé";
        this.msg.push({ step: "update", msg: "Mise à jour des informations d'adhesion", dt: new Date(), status: "En cours" })
        this.envelopUpdateTabs(this.signSend['envelopeId']).then(response => {
          this.msg[this.msg.length - 1].status = "Terminé";
          this.msg.push({ step: "send", msg: "Envoi pour signature", dt: new Date(), status: "En cours" })
          this.sendEnvelopWithData(this.signSend['envelopeId']).then(response => {
            this.msg[this.msg.length - 1].status = "Terminé";
            this.msg.push({ step: "sign", msg: "Préparation des actions CLIENT", dt: new Date(), status: "En cours" })
            this.envelopGetRecipientSent(this.signSend['envelopeId']);
            this.msg[this.msg.length - 1].status = "Terminé";
            this.msg.push({ step: "end", msg: "Signature prête", dt: new Date(), status: "Terminé" })
          }, error => {

          })
        }, error => {

        })
      }, error => { });
    } else {
      let alert = this.alertCtrl.create({
        title: 'Modèle de documents',
        subTitle: 'Veuillez choisir un à N modèles de document dans la liste',
        buttons: ["J'ai compris"]
      });
      alert.present();
    }
  }
  envelopCreateFromModels() {
    return new Promise((resolve, reject) => {
      // Create the envelop with multi-model
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
        this.signSend['envelopeId'] = response['envelopeId'];
        loader.dismiss();
        resolve(response['envelopeId']);
      }, function (reason) {
        console.log("Create Envelope error", reason);
        loader.dismiss();
        let toast = this.toastCtrl.create({
          message: "Erreur à la création de l'enveloppe : " + reason,
          duration: 3000,
          position: "bottom"
        });
        toast.present();
        reject(null);
      });
    });
  }
  envelopUpdatePages() {

  }
  envelopUpdateTabs(envelopeId) {
    return new Promise((resolve, reject) => {
      let loader = this.loadingCtrl.create({
        content: "Appel à DOCUSIGN : Mise à jour des données par rôle...",
        duration: 10000
      });
      loader.present();

      this.getAllRecipientsWithTabs(envelopeId).then(response => {
        //console.log(response);
        this.envelopeRecipients = response;
        // 3. Apply DATA on TABS 
        this.envelopeRecipients.forEach(element => {
          // =====Update Tabs data
          let tabsData = element['tabs'];
          for (var typeSign in tabsData) {
            for (var typeTab in tabsData[typeSign]) {
              let fl = tabsData[typeSign][typeTab]['tabLabel'];
              let f = fl.substring(fl.indexOf("_") + 1)
              if (this.adhesion[f]) {
                tabsData[typeSign][typeTab]['value'] = this.adhesion[f];
              }
            }
          }
          element['tabs'] = tabsData;

          // ===== Update Recipient data
          let random = new Chance();
          element['accessCode'] = random.natural({ min: 1, max: 9999 });
          element['recipientIdGuid'] = 0;
          let r = this.process.filter(item => item.role == element['roleName']);
          if (r.length > 0) {
            let cli = this.getClient(r[0]['clientId']);
            if (element['note'] == "inPersonSigners") {
              element['signerEmail'] = cli['email'];
              element['signerName'] = cli['cum_identite'];
              element['hostEmail'] = this.conseiller['email'];
              element['hostName'] = this.conseiller['name'];
            } else {
              element['email'] = cli['email'];
              element['name'] = cli['cum_identite'];
            }
            if (element['roleName'] == "CONSEILLER") {
              element['name'] = this.conseiller['name'];
              element['email'] = this.conseiller['email'];
            }
          } else {
            console.info("Role non trouvé dans le paramétrage edition", element['roleName']);
          }
        });

        // 3. Call DOCUSIGN for UPDATE RECIPIENT TABS 
        this.nextUpdateRecipientTabs(-1);
        // 4. Call DOCUSIGN for UPDATE RECIPIENT
        this.events.subscribe("AllTabsUptdated", response => {
          // Preparation des données pour mise à jour des destinataires
          let data = {};
          this.envelopeRecipients.forEach(element => {
            delete element['tabs'];
            data[element['note']] = [];
          });
          this.envelopeRecipients.forEach(element => {
            data[element['note']].push(element);
          });
          // API : Mise à jour de la liste des destinataires
          console.log("Mise à jour des destinataires", data);
          this.docuSign.updateRecipients(envelopeId, data).then(response => {
            //console.log(response);
            loader.dismiss();
            let toast = this.toastCtrl.create({
              message: "Destinataires de l'Enveloppe mise à jour",
              duration: 3000,
              position: "bottom"
            });
            toast.present();
            resolve(true);
          }, error => {
            console.log(error);
            loader.dismiss();
            let toast = this.toastCtrl.create({
              message: "Erreur à la mise à jour de l'enveloppe : ",
              duration: 3000,
              position: "bottom"
            });
            toast.present();
            resolve(false);
          })
        })
        loader.dismiss();
      }, error => {
        resolve(false);
      })
    });
  }
  sendEnvelopWithData(envelopeId) {
    return new Promise((resolve, reject) => {
      let loader = this.loadingCtrl.create({
        content: "Appel à DOCUSIGN : Envoi de l'enveloppe...",
        duration: 10000
      });
      loader.present();
      this.docuSign.sendEnv(envelopeId).then(response => {
        console.log(response);
        loader.dismiss();
        let toast = this.toastCtrl.create({
          message: "Enveloppe envoyée pour signature",
          duration: 3000,
          position: "bottom"
        });
        toast.present();
        this.docuSign.getEnvelope(envelopeId).then(env => {
          console.log("Enveloppe", env);
          this.signSend['envelopeData'] = env;
          resolve(true);
        }, error => {
          console.log(error);
          reject(false);
        })
      }, error => {
        console.log(error);
        loader.dismiss();
        let alert = this.alertCtrl.create({
          title: "Erreur lors de l'envoi de l'enveloppe",
          subTitle: error['_body']['errorCode'],
          message: error['_body']['message'],
          buttons: ["J'ai compris."]
        });
        alert.present();
        reject(false);
      })
    });
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
  /* ======Opération faites par le client ============
  
  ===================================================*/
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
  // =================================================
  // Lecture des destinataires et des champs associés
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
  // API : Mise à jour d'un destinataire
  nextUpdateRecipientTabs(idx) {
    idx = idx + 1;
    if (this.envelopeRecipients.length > idx) {
      //console.log("RECIPIENT", idx, this.envelopeRecipients[idx]);
      let tabs = this.envelopeRecipients[idx]['tabs'];
      let i = this.envelopeRecipients[idx]['recipientId'];
      let role = this.envelopeRecipients[idx]['roleName'];
      this.updateRecipientTabs(idx, i, tabs, role);
    } else {
      console.log("UPDATE FINISHED");
      this.events.publish("AllTabsUptdated", true);
    }
  }
  // API : Mise à jour des champs pour un destinataire
  updateRecipientTabs(idx, recipientId, tabs, role) {
    let loader = this.loadingCtrl.create({
      content: "Appel à DOCUSIGN : mise à jour des données pour le rôle " + role,
    });
    loader.present();
    this.docuSign.updateEnvelopeTabs(this.signSend['envelopeId'], recipientId, tabs).then(response => {
      //console.log(response);
      loader.dismiss();
      this.nextUpdateRecipientTabs(idx);
    }, error => {
      loader.dismiss();
      console.error(error);
    })
  }
  // =================================================
}
