import { Component } from '@angular/core';
import { NavController, NavParams, Events, AlertController, ActionSheetController } from 'ionic-angular';
import { SellandsignServices } from '../../../providers/sign/sellandsign';
import { CouchDbServices } from '../../../providers/couch/couch';
import { WinExternal } from '../../../providers/win-external';
import { DomSanitizer } from '@angular/platform-browser';


declare var Chance: any;
/*
  Generated class for the Sellandsign page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/
@Component({
  selector: 'page-sellandsign',
  templateUrl: 'sellandsign.html'
})
export class SellandsignPage {
  plainScreen: boolean = false;
  lstUseCase: any = [];
  lstApi: any;
  option: any = "modelSign";
  displayData: boolean = false;
  dataResult: any;
  dataHtml: any = null;
  sendData: any = {};
  mappingClient: any;
  signSafeUrl: any = null;
  fileSign: any = null;
  percentProgress: any = 0;
  msgProgress: any = [];
  constructor(public navCtrl: NavController, public navParams: NavParams, public events: Events,
    public alertCtrl: AlertController, public actionSheetCtrl: ActionSheetController,
    public winCtrl: WinExternal,
    private sanitizer: DomSanitizer,
    private sellandsign: SellandsignServices, private couch: CouchDbServices) {
    this.lstApi = [
      { "code": "modelSign", "title": "Signer un nouveau document", "method": "" },
      { "code": "oneSign", "title": "Signature à la pièce", "method": "" },
      { "code": "detail", "title": "Détail", "method": "" },
      { "code": "factures", "title": "Facturation", "method": "" },
    ]
    this.mappingClient = {
      "number": "ref",
      "actorId": "id",
      "customer_code": "ref",
      "civility": "",
      "firstname": "prenom",
      "lastname": "nom",
      "address_1": "adresse",
      "address_2": "",
      "postal_code": "codePostal",
      "city": "ville",
      "phone": "",
      "email": "email",
      "company_name": "raisonSociale",
      "country": "pays",
      "cell_phone": "mobile",
      "job_title": "",
      "registration_number": "",
      "birthdate": -1,
      "birthplace": "lieu_naissance"

    };
  }
  ionViewDidLoad() {
    console.log('Hello SellandsignPage Page');
  }
  ngOnInit() {
    this.sendData = {
      "useCase": null,
      "clients": [],
      "contractors": [],
      "contract": null,

    };
    this.signSafeUrl = null;
    this.getUseCase();
  }
  presentActionSheet() {
    let actionSheet = this.actionSheetCtrl.create({
      title: 'Options Sell And Sign',
      buttons: [
        {
          text: 'API',
          handler: () => {
            let url = "http://www.sellandsign.com/fr/api-signature-electronique-introduction/";
            window.open(url, '_system');
          }
        }, {
          text: 'Console administration',
          handler: () => {
            let url = "http://2.int.dev.calindasoftware.com/calinda/hub/selling/back_office";
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
  getUseCase() {
    this.couch.getDbViewDocs('poc_data', 'byType', 'sign', 100, 0).then(response => {
      //console.log(response);
      this.lstUseCase = response['rows'];
    }, error => {
      console.error(error);
    });
  }
  updateLstClients() {
    let u = this.lstUseCase.filter(item => item['value']['name'] == this.sendData['useCase']);
    let usecase = u[0]['value']['dataUseCase'];
    //console.log("UseCase selected", usecase);
    this.sendData['clients'] = [];
    let idx = 0;
    let customer_number = "";
    for (var key in usecase['process']) {
      let cli = usecase['clients'][usecase['process'][key]];
      //Mapping between usecase and api
      if (idx == 0) customer_number = cli['ref'];
      let tmp = {};
      tmp['role'] = key;
      for (var keyMap in this.mappingClient) {
        //console.log(keyMap, this.mapping[keyMap]);
        if (this.mappingClient[keyMap] != "") {
          tmp[keyMap] = cli[this.mappingClient[keyMap]];
        } else {
          tmp[keyMap] = '';
        }
      }
      tmp['cliUpdated'] = null;
      tmp['contractorUpdated'] = null;
      tmp['customer_number'] = customer_number;
      this.sendData['clients'].push(tmp);
      idx++;
    }
  }
  selectFile($event): void {
    var inputValue = $event.target;
    //var files = $event.srcElement.files
    this.fileSign = inputValue.files[0];
    console.log("Input File name: " + this.fileSign.name + " type:" + this.fileSign.type + " size:" + this.fileSign.size);
  }
  sendDoc() {
    this.sellandsign.getObserver()
      .subscribe(progress => {
        this.percentProgress = progress;
      });
    this.sellandsign.uploadContract(this.sendData['contract']['id'], this.fileSign, this.fileSign['name']).subscribe((data) => {
      console.log(data);
    });
  }
  createClient(item) {
    this.sellandsign.createClient(item).then(response => {
      console.log("CLI create/update", response);
      item['cliUpdated'] = new Date(response['syncTimer']).toISOString();
    }, error => {
      console.error(error);
      this.dataResult = error;
    })
  }
  createClientAll() {
    this.sendData['clients'].forEach(item => {
      this.createClient(item);
    });
  }
  createContratctor(item) {
    this.sellandsign.getOrCreateContractor(item['customer_number'], item).then(response => {
      console.log("Contractor create/update", response);
      item['contractorUpdated'] = new Date(response['syncTimer']).toISOString();
      //item['updated'] = response['syncTimer'];
    }, error => {
      console.error(error);
      this.dataResult = error;
    })
  }
  createContractorAll() {
    this.sendData['clients'].forEach(item => {
      this.createContratctor(item);
    });
  }
  createContract(item) {
    let ts = Math.floor(Date.now() / 1000);
    let id = item['customer_code'];
    this.sellandsign.createContract(id, ts).then(response => {
      console.log("CONTRACT create", response);
      this.sendData["contract"] = response;
    }, error => {
      console.error(error);
      this.dataResult = error;
    })
  }
  addContractorsToContratAll() {
    this.sendData['clients'].forEach(item => {
      this.addContractorsToContrat(item);
    });
  }
  addContractorsToContrat(item) {
    console.log(item);
    this.sellandsign.addContractorTo(this.sendData['contract']['id'], item['actorId'], 1).then(response => {
      //console.log(response);
      this.sendData["contractors"].push(response);
    }, error => {
      console.error(error);
    })
  }
  signUrl() {
    //let win = this.winCtrl.openWin('/assets/pages/loadingUrl.html');
    console.log(this.sendData);
    this.sellandsign.generateTempToken(this.sendData['customer_number'], this.sendData['contract']['id']).then(response => {
      console.log(response);
      if (response) {
        //win.location.href = response['url'];
        this.signSafeUrl = this.sanitizer.bypassSecurityTrustResourceUrl(response['url']);
        this.plainScreen = true;
      }
    }, error => {
      console.error(error);
    })
  }
}
