import { Component, ViewChild } from '@angular/core';
import { Platform, NavController, NavParams, Events, AlertController, LoadingController, ActionSheetController, Slides, PopoverController, ToastController } from 'ionic-angular';
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
  storedEnvelopes: any = []           // Liste des enveloppes stockées localement
  selEnvelop: any = null;             // Envelope séléctionnées à partir du stockage local

  statusCode: any = null              // Liste des status d'enveloppes, traduction incluse
  signSend: any = null;               // Structure de stockage des données anvoyées à la signature
  // ===== Variables de stockage des information de l'adhesion =====
  folderFilter: any = null            // Varriable de filtre des templates disponibles
  lstUseCase: any = null              // Liste des cas d'usage : demo
  clients: any = null;                // Liste des clients
  conseiller: any = null              // Conseiller connécté
  adhesion: any = null;               // Données de l'adhésion
  process: any = null;                // Processus d'adhesion
  pagesToDelete: any = null           // Liste des pages inutiles, à trier en ordre inverse 

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
    this.getLstModel();
    this.couch.getParams().then(data => {
      this.params = data;
      this.getUseCase();
    }).catch(error => {
      this.params = null;
      this.getUseCase();
    })
    this.getStoredEnvelopes();
    this.newSign();
  };
  newSign() {
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
    this.process = null;
    this.adhesion = null;
    this.pagesToDelete = null;
    this.envelopeRecipients = null;
    this.envelopeRecipientsSent = null;
    this.docsModel = null;
    //this.folderFilter = 'Templates';
    this.folderFilter = 'model';
  }
  goNext() {
    this.slides.slideNext()
  }
  goPrevious() {
    this.slides.slidePrev();
  }
  goNew() {
    this.slides.slideTo(1);
    this.newSign();
  }
  goHome() {
    this.navCtrl.pop();
  }
  // ===== Only for proto datas ======
  getUseCase() {
    // filter for Test Only
    this.couch.getDbViewDocs('poc_data', 'byType', 'sign', 100, 0, this.params).then(response => {
      this.lstUseCase = response['rows'].filter(item => item['value']['modeProto'] == true);
      //console.log(response, this.lstUseCase);
      console.info("USECASE readed");
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
      this.pagesToDelete = usecase['pagesToDelete'];
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
  selectRole(item) {
    let alert = this.alertCtrl.create();
    alert.setTitle("Quels sont les rôles de la personne dans l'adhesion ?");
    this.process.forEach(elt => {
      alert.addInput({
        type: 'checkbox',
        label: elt['role'],
        value: elt['role'],
        checked: false
      });
    });
    alert.addButton('Annuler');
    alert.addButton({
      text: 'Choisir',
      handler: data => {
        //console.log('Checkbox data:', data);
        item.roles = data;
      }
    });
    alert.present();

  }
  verifRole() {
    // Vérification choix role unique

  }
  // ====== Dousign Operations =======
  getLstModel() {
    this.docuSign.getTemplates().then(response => {
      this.lstModels = response;
      console.info("TEMPLATES readed", response);
    }, error => {
      console.log("Templates error", error);
    })
  }
  getModelDocs() {
    //console.log("Get models docs", this.signSend['docModel'])
    this.docsModel = [];
    this.signSend['docModel'].forEach(element => {
      //console.log(element);
      this.docuSign.getModelDocument(element).then(response => {
        //console.log("Docs of model", response);
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
        this.msg[this.msg.length - 1].status = "Terminé";
        this.msg.push({ step: "roleFusion", msg: "Analyse des destinataires", dt: new Date(), status: "En cours" })
        this.envelopDocuments(this.signSend['envelopeId']);
        this.envelopFusionRole(this.signSend['envelopeId']).then(response => {
          this.msg[this.msg.length - 1].status = "Terminé";
          this.msg.push({ step: "pageDelete", msg: "Supression des pages inutiles", dt: new Date(), status: "En cours" })
          this.envelopUpdatePages(this.signSend['envelopeId']).then(response => {
            this.msg.push({ step: "send", msg: "Envoi pour signature", dt: new Date(), status: "En cours" })
            this.sendEnvelopWithData(this.signSend['envelopeId']).then(response => {
              this.msg[this.msg.length - 1].status = "Terminé";
              this.msg.push({ step: "sign", msg: "Préparation des actions CLIENT", dt: new Date(), status: "En cours" })
              this.envelopGetRecipientSent(this.signSend['envelopeId']);
              this.msg[this.msg.length - 1].status = "Terminé";
              this.msg.push({ step: "end", msg: "Signature prête", dt: new Date(), status: "Terminé" });
            }, error => { })
          }, error => { })
        }, error => {
          console.log(error);
        })
        /*
          this.msg[this.msg.length - 1].status = "Terminé";
          this.msg.push({ step: "pageDelete", msg: "Supression des pages inutiles", dt: new Date(), status: "En cours" })
          this.envelopUpdatePages(this.signSend['envelopeId']).then(response => {
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
                this.msg.push({ step: "end", msg: "Signature prête", dt: new Date(), status: "Terminé" });
              }, error => { })
            }, error => { })
          }, error => { });
        */
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
        content: "DocuSign : création de l'enveloppe à partir des modèles...",
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
  envelopFusionRole(envelopeId) {
    return new Promise((resolve, reject) => {
      let loader = this.loadingCtrl.create({
        content: "DocuSign : Mise à jour des destinataires...",
      });
      loader.present();
      let random = new Chance();
      console.info("FUSION des destintaires/roles en trop dans l'envelope");
      this.getAllRecipientsWithTabs(envelopeId).then(response => {
        let lstRoles = response;
        this.docuSign.removeRecipientsFormDocEnv(envelopeId, { "inPersonSigners": response }).then(response => {
          console.info("Suppression des destinataires de l'enveloppe : OK");
          let lstIdRoleToSuppress = [];
          let roleFusion = new groupBy().transform(lstRoles, "roleName");
          //console.log(roleFusion);
          for (var key in roleFusion) {
            if (roleFusion[key].length > 1) {
              //console.debug("Fusion des champs pour le role ", key);
              let tabDest = roleFusion[key][0]['tabs'];
              for (let i = 1; i < roleFusion[key].length; i++) {
                let t = roleFusion[key][i]['tabs'];
                for (var typeTab in t) {
                  //console.debug("Fusion pour le type ", typeTab);
                  if (!tabDest.hasOwnProperty(typeTab)) {
                    tabDest[typeTab] = [];
                  }
                  let result = tabDest[typeTab].concat(t[typeTab]);
                  tabDest[typeTab] = result;
                  roleFusion[key][i]['tabs'] = {};
                }
                roleFusion[key][0]['tabs'] = tabDest;
                lstIdRoleToSuppress.push(roleFusion[key][i]['recipientId'])
              }
            }
          }
          console.info("Résultat de la fusion des roles : ", roleFusion);
          console.info("Destinataires à supprimer : ", lstIdRoleToSuppress);
          console.info("Mise à jour des destinataires : ", lstRoles);
          for (var d in lstRoles) {
            // Suppression du destinataires 
            lstIdRoleToSuppress.forEach(elt => {
              try {
                if (elt == lstRoles[d]['recipientId']) {
                  console.debug("Destinataire supprimé : ", d, "#ID:", lstRoles[d]['recipientId']);
                  delete lstRoles[d];
                }
              } catch (e) { }
            });
          }
          // Mise à jour des champs et de l'ordre de signature
          let validRoles = [];
          let validTabs = [];
          for (var d in lstRoles) {
            let roleMaj = lstRoles[d]['roleName'];
            console.debug("Mise à jour des champs pour le role ", roleMaj, lstRoles[d]);
            lstRoles[d]['tabs'] = roleFusion[roleMaj][0]['tabs'];
            // Mise àjour de l'ordre de signature paramétré ===
            lstRoles[d]['routingOrder'] = this.process.filter(item => item['role'] == roleMaj)[0]['ordre'];
            // Affectation des clients aux roles
            let c = this.clients.filter(item => item.roles.indexOf(roleMaj) >= 0)
            console.info("Client role trouvé :", c);
            if (c.length > 0) {
              lstRoles[d]['signerEmail'] = c[0]['email'];
              lstRoles[d]['signerName'] = c[0]['cum_identite'];
              lstRoles[d]['hostEmail'] = this.conseiller['email'];
              lstRoles[d]['hostName'] = this.conseiller['name'];
              lstRoles[d]['accessCode'] = random.natural({ min: 1, max: 9999 });
              let tabsData = lstRoles[d]['tabs'];
              for (var typeSign in tabsData) {
                for (var typeTab in tabsData[typeSign]) {
                  let fl = tabsData[typeSign][typeTab]['tabLabel'];
                  let f = fl.substring(fl.indexOf("_") + 1)
                  if (this.adhesion[f]) {
                    tabsData[typeSign][typeTab]['value'] = this.adhesion[f];
                  }
                }
              }
              //lstRoles[d]['tabs'] = tabsData;
              delete lstRoles[d]['tabs'];
              validRoles.push(lstRoles[d]);
              validTabs.push({ "recipientId": lstRoles[d]['recipientId'], "roleName": lstRoles[d]['roleName'], "tabs": tabsData })
            }
          }
          console.info("Destinataires finaux", validRoles);
          this.docuSign.addRecipientsFormDocEnv(envelopeId, { "inPersonSigners": validRoles }).then(response => {
            console.log("Mise à jour des destinataires : OK", response);
            console.info("Mise à jour des données par destinataire");
            this.nextAddRecipientTabs(validTabs, -1);
            this.events.subscribe("AllTabsAdded", response => {
              loader.dismiss();
              let toast = this.toastCtrl.create({
                message: "Destinataires de l'Enveloppe mise à jour",
                duration: 3000,
                position: "bottom"
              });
              toast.present();
              resolve(true);
            });
          }, error => {
            loader.dismiss();
            console.log("Erreur de mise à jour des destinataires", response);
            reject(false);
          });
        }, error => {
          loader.dismiss();
          console.error("Erreur de supression des destinataires", error);
          reject(false);
        })
      }, error => {
        loader.dismiss();
        console.error("Erreur de lectures des destinatires de l'enveloppe", error);
        reject(false);
      })
    });
  }
  envelopDocuments(envelopId) {
    console.info("Liste de documents de l'envelope");
    this.docuSign.getEnvelopeDocuments(envelopId).then(response => {
      console.log(response);
    }, error => {
      console.error(error);
    })
  }
  envelopUpdatePages(envelopeId) {
    return new Promise((resolve, reject) => {
      this.nextUpdatePages(envelopeId, -1);
      this.events.subscribe("AllPagesUpdated", response => {
        resolve(true);
      }, error => {
        reject(error);
      })
    })
  }
  /* ==== NON UTILISE =====
  envelopUpdateTabs(envelopeId) {
    return new Promise((resolve, reject) => {
      let loader = this.loadingCtrl.create({
        content: "DocuSign : Mise à jour des données par rôle...",
        duration: 10000
      });
      loader.present();
      this.getAllRecipientsWithTabs(envelopeId).then(response => {
        //console.log(response);
        this.envelopeRecipients = response;
        // 3. Apply DATA on TABS
        let deleteRecipients = {};
        this.envelopeRecipients.forEach((element, idx) => {
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
            // Mise à jour des données destinataire
            element['smadelete'] = false;
            let cli = this.getClient(r[0]['clientId']);
            if (element['typeSign'] == "inPersonSigners") {
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
            //console.info("Role non trouvé dans le paramétrage édition", element, idx);
            //supression du role dans les documents
            element['smadelete'] = true;
            if (!deleteRecipients[element['typeSign']]) {
              deleteRecipients[element['typeSign']] = [];
            }
            deleteRecipients[element['typeSign']].push({ "recipientId": element['recipientId'] });
          }
        });
        this.docuSign.removeRecipientsFormDocEnv(envelopeId, deleteRecipients).then(response => {
          console.info("DEST : Supprimés de l'enveloppe", response);
          // 4. Call DOCUSIGN for UPDATE RECIPIENT TABS 
          this.nextUpdateRecipientTabs(-1);
          // 5. Call DOCUSIGN for UPDATE RECIPIENT
          this.events.subscribe("AllTabsUpdated", response => {
            // Preparation des données pour mise à jour des destinataires
            console.log("Destinataires", this.envelopeRecipients);
            let data = {};
            this.envelopeRecipients.forEach(element => {
              let key = element['typeSign'];
              delete element['tabs'];
              data[key] = [];
            });
            this.envelopeRecipients.forEach(element => {
              let key = element['typeSign'];
              if (!element['smadelete']) {
                data[key].push(element);
              }
            });
            console.log("Destinataires", data);
            // API : Mise à jour de la liste des destinataires
            console.info("Mise à jour des destinataires", data);
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
        }, error => { })

      }, error => {
        resolve(false);
      })
    });
  }
  */

  sendEnvelopWithData(envelopeId) {
    return new Promise((resolve, reject) => {
      let loader = this.loadingCtrl.create({
        content: "DocuSign : Envoi de l'enveloppe...",
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
  /* ======Opérations faites par le client ============
  
  ===================================================*/
  envelopeReorderProcess(envelopId, recipients) {
    let loader = this.loadingCtrl.create({
      content: "DocuSign : Mise à jour du processus de signature...",
    });
    loader.present();
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
  signBySender(envelopeId) {
    let loader = this.loadingCtrl.create({
      content: "DocuSign : envoie des données de signature en cours...",
    });
    loader.present();
    //let win =
    this.winCtrl.openWin('/assets/pages/loadingUrl.html');
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
    if (envelopeId) {
      //let win = this.winCtrl.openWin('/assets/pages/loadingUrl.html');
      //{"authenticationMethod":"password","email":"doc.gautier@gmail.com","returnUrl":"http://gautiersa.fr/vie/docuSignReturn","userName":"doc.gautier@gmail.com"}
      let loader = this.loadingCtrl.create({
        content: "DocuSign : ouverture de la page de signature en cours...",
        duration: 10000
      });
      loader.present();
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
        loader.dismiss();
        //console.log(data);
        //this.sendSign['urlSign'] = data['url'];
        this.winCtrl.openWin(data['url']);
        //win.location.href = data['url'];
      }, reason => {
        loader.dismiss();
        console.log('Failed: ' + JSON.stringify(reason));
        //win.document.body.innerHTML = "Erreur de préparation.<br>Veuillez fermer cet onglet.";
      })
      loader.dismiss();
    }
  };
  voidSignedDoc(envelopeId) {
    let loader = this.loadingCtrl.create({
      content: "DocuSign : invalidation du document en cours...",
    });
    loader.present();
    this.docuSign.voidDocEnv(envelopeId, null).then(data => {
      console.log(data);
      loader.dismiss();
    }, reason => {
      console.log('Failed: ', reason);
      loader.dismiss();
    })
  };
  refusedByClient(envelopeId, idx, refusData) {
    let loader = this.loadingCtrl.create({
      content: "DocuSign : refus de signature en cours...",
    });
    loader.present();
    let d = {};
    let k = refusData['key'];
    let v = refusData['value'][idx];
    v['declinedReason'] = "Signature papier"
    v['declinedDateTime'] = new Date();
    d[k] = [];
    d[k].push(v)
    console.log(d);
    this.docuSign.refuseDocEnv(envelopeId, d).then(response => {
      console.log(response);
      loader.dismiss();
      let toast = this.toastCtrl.create({
        message: "Signature par papier mémorisée.",
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
              element['typeSign'] = dest;
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
  // API : boucle d'ajout des champs pour un destinataire
  nextAddRecipientTabs(roles, idx) {
    idx = idx + 1;
    if (roles.length > idx) {
      //console.log("RECIPIENT", idx, this.envelopeRecipients[idx]);
      let tabs = roles[idx]['tabs'];
      let i = roles[idx]['recipientId'];
      let role = roles[idx]['roleName'];
      this.addRecipientTabs(roles, idx, i, tabs, role);
    } else {
      //console.log("UPDATE FINISHED");
      this.events.publish("AllTabsAdded", true);
    }
  }
  // API : Ajout des champs pour un destinataire
  addRecipientTabs(roles, idx, recipientId, tabs, role) {
    let loader = this.loadingCtrl.create({
      content: "DocuSign : mise à jour des données pour le rôle " + role,
    });
    loader.present();
    this.docuSign.addRecipientsTabs(this.signSend['envelopeId'], roles[idx]['recipientId'], tabs).then(response => {
      //console.log(response);
      loader.dismiss();
      this.nextAddRecipientTabs(roles, idx);
    }, error => {
      loader.dismiss();
      console.error(error);
    })
  }

  /* ===== NON UTILISE ===== API : Mise à jour d'un destinataire
  nextUpdateRecipientTabs(idx) {
    idx = idx + 1;
    if (this.envelopeRecipients.length > idx) {
      //console.log("RECIPIENT", idx, this.envelopeRecipients[idx]);
      let tabs = this.envelopeRecipients[idx]['tabs'];
      let i = this.envelopeRecipients[idx]['recipientId'];
      let role = this.envelopeRecipients[idx]['roleName'];
      if (!this.envelopeRecipients[idx]['smadelete']) {
        this.updateRecipientTabs(idx, i, tabs, role);
      } else {
        this.nextUpdateRecipientTabs(idx);
      }
    } else {
      //console.log("UPDATE FINISHED");
      this.events.publish("AllTabsUpdated", true);
    }
  }
  // ===== NON UTILISE =====  API : Mise à jour des champs pour un destinataire
  updateRecipientTabs(idx, recipientId, tabs, role) {
    let loader = this.loadingCtrl.create({
      content: "DocuSign : mise à jour des données pour le rôle " + role,
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
  */



  // API : Supression des pages inutiles
  nextUpdatePages(envelopeId, idx) {
    idx = idx + 1;
    if (this.pagesToDelete.length > idx) {
      let page = this.pagesToDelete[idx];
      this.updatePage(envelopeId, page, idx);
    } else {
      console.log("UPDATE Pages FINISHED");
      this.events.publish("AllPagesUpdated", true);
    }
  }
  updatePage(envelopeId, page, idx) {
    console.info("Delete in docId ", page['docId'], " pageId", page['pageId'])
    this.docuSign.removePageFormDocEnv(envelopeId, page['docId'], page['pageId']).then(response => {
      console.log(response);
      this.nextUpdatePages(envelopeId, idx);
    }, reason => {
      console.error(reason);
    });
  }
  // =================================================
  showStoredEnvelopes() {
    this.docuSign.getStoredEnvelopes().then(data => {
      if (data) {
        this.storedEnvelopes = data;
        let alert = this.alertCtrl.create();
        alert.setTitle('Enveloppes enregistrées');
        alert.setCssClass("alertcss");
        this.storedEnvelopes.forEach(element => {
          alert.addInput({
            type: 'radio',
            label: element['statusDateTime'],
            value: element['envelopeId'],
            checked: false
          });
        });
        alert.addButton('Annuler');
        alert.addButton({
          text: 'Choisir',
          handler: data => {
            console.log("Envelop selected", data);
            this.envelopGetRecipientSent(data);
            this.signSend['envelopeId'] = data;
          }
        });
        alert.present();
      } else {
        this.storedEnvelopes = [];
        let toast = this.toastCtrl.create({
          message: 'Aucune enveloppe enregistrée',
          duration: 3000,
          position: 'middle'
        });
        toast.present();
      }
    }, error => {
      console.log("Fonction Storage non disponible");
    });

  }
  getStoredEnvelopes() {
    this.docuSign.getStoredEnvelopes().then(data => {
      console.info("HISTORY readed");
      this.storedEnvelopes = data;
    }, error => {
      this.storedEnvelopes = [];
    });
  }
}
