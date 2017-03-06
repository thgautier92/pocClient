import { Component, ViewChild } from '@angular/core';
import { Platform, NavController, NavParams, Events, AlertController, LoadingController, ActionSheetController, Slides, PopoverController, ViewController, ToastController } from 'ionic-angular';
import { DocuSignServices } from '../../../providers/sign/docuSign';
import { CouchDbServices } from '../../../providers/couch/couch';
import { WinExternal } from '../../../providers/win-external';
import { PdfComponent } from '../../../components/pdf/pdf';
import { FilesOperation } from '../../../providers/files-operation';

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
  params: any = null;           // Paramétres de connexion à COUCHDB
  signSend: any = null;         // Structure de stockage des données anvoyées à la signature
  // ===== Variables de stockage des information de l'adhesion =====
  lstUseCase: any = null        // Liste des cas d'usage : demo
  clients: any = null;          // Liste des clients
  conseiller: any = null        // Conseiller connécté
  adhesion: any = null;         // Données de l'adhésion
  process: any = null;          // Processus d'adhesion

  lstModels: any = null         // Liste des modèles de signature DocuSign
  docsModel: any = null         // Liste des documents contenus dans le(s) modèle(s)

  constructor(public platform: Platform, public navCtrl: NavController, public navParams: NavParams,
    public events: Events, public alertCtrl: AlertController, public actionSheetCtrl: ActionSheetController,
    public loadingCtrl: LoadingController,
    public winCtrl: WinExternal,
    public fileOpe: FilesOperation,
    public popoverCtrl: PopoverController,
    public toastCtrl: ToastController,
    private docuSign: DocuSignServices, private couch: CouchDbServices) { }

  ionViewDidLoad() {
    console.log('ionViewDidLoad SmavieMobilitePage');
  }
  ngOnInit() {
    this.signSend = {
      "useCase": null,
      "data": null,
      "docModel": null,
      "envelopeId": null,
      "envData": null
    };
    this.clients = null;
    this.conseiller = null;
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
  // 
}
