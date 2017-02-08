import { Component } from '@angular/core';
import { Platform, NavController, NavParams, Events, AlertController, LoadingController, ActionSheetController } from 'ionic-angular';
import { DocuSignServices } from '../../../providers/sign/docuSign';
import { CouchDbServices } from '../../../providers/couch/couch';
//import { WinExternal } from '../../../providers/win-external';

/*
  Generated class for the Docusign page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/
@Component({
  selector: 'page-docusignmodel',
  templateUrl: 'docusignmodel.html'
})
export class DocuSignModel {
  params: any;
  accountInfo: any;
  lstApi: any;
  signModel: any;
  lstModels: any = [];
  lstUseCaseModel: any = [];
  saveModel: any;
  docsModel: any = null;
  statusCode: any;
  dataDoc: any = null;
  defaultTextTab: any;
  display: any = { dataModel: false, generatorModel: false };
  constructor(public platform: Platform, public navCtrl: NavController, public navParams: NavParams,
    public events: Events, public alertCtrl: AlertController, public actionSheetCtrl: ActionSheetController,
    public loadingCtrl: LoadingController,
    private docuSign: DocuSignServices, private couch: CouchDbServices) {
    this.signModel = {
      "useCase": "",
      "docModel": "",
      "doc": null,
      "docModelFields": ""
    }
    this.events.subscribe('fileSelected', fileData => {
      console.log("File", fileData);
      this.signModel['doc'] = fileData;
    })
  };
  ngOnInit() {
    this.signModel = {
      "useCase": "",
      "docModel": "",
      "doc": null,
      "docModelFields": ""
    }
    this.couch.getParams().then(data => {
      console.log("Params", data);
      this.params = data;
      this.getUseCaseModel();
    }).catch(error => {
      this.params = null;
      this.getUseCaseModel();
    })
    this.getLstModel();
    this.dataDoc = { "documents": null, "signProcess": null, "fieldsByRole": null };
  };
  ionViewDidLoad() {
    console.log('Hello DocuSignModel Page');
  };
  getLstModel() {
    this.docuSign.getTemplates().then(response => {
      //console.log("Templates", response);
      this.lstModels = response;
    }, error => {
      console.log("Templates error", error);
    });
  };
  getUseCaseModel() {
    this.couch.getDbViewDocs('poc_data', 'byType', 'signModel', 100, 0, this.params).then(response => {
      console.log("Use case model", response);
      this.lstUseCaseModel = response['rows'];
    }, error => {
      console.error(error);
    });
  };
  loadModel() {
    let loader = this.loadingCtrl.create({ content: "Analyse du modèle.Veuillez patienter...", duration: 10000 });
    loader.present();
    //console.log(this.signModel['docModel']);
    this.docuSign.getModelDocument(this.signModel['docModel']).then(response => {
      //console.log(response);
      this.dataDoc['documents'] = response;
    }, error => {
      console.error(error);
    });
    this.docuSign.getModelProcess(this.signModel['docModel']).then(response => {
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
            this.docuSign.getModelFields(this.signModel['docModel'], id).then(responseFields => {
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
  };
  generateModelData() {
    let loader = this.loadingCtrl.create({
      content: "Appel à DOCUSIGN : création du modèle en cours...",
      duration: 20000
    });
    let documentId = 1;
    let data = {
      "documents": [
        {
          "documentBase64": this.signModel['doc']['data'],
          "documentId": documentId,
          "name": this.signModel['doc']['file']['name'],
        }
      ],
      "emailSubject": "SMAVIE-Vous avez un document à signer electroniquement",
      "envelopeTemplateDefinition": {
        "description": "test",
        "name": "TEST-Creation par API"
      },
      "recipients": {
        "inPersonSigners": []
      }
    };
    let roles = this.signModel['useCase']['value']['dataUseCase']['roles'];
    let map = this.signModel['useCase']['value']['dataUseCase']['mapping'];
    let step = 20;
    roles.forEach((r, idx) => {
      console.log("Generate fields for role", idx, r);
      let recipientId = idx + 1;
      // Create Role
      let role = { "recipientId": recipientId, "roleName": r };
      if (idx == 0) {
        // Create tabs
        let page = 1
        let y = 0;
        let textTabs = [];
        let listTabs = [];
        let checkTabs = [];
        let noteTabs = [];
        for (var userKey in map) {
          y = y + step;
          if (y > 800) {
            page = page + 1;
            y = step;
          }
          console.log(userKey, page, y);
          let tbs = {
            "documentId": documentId,
            "pageNumber": page,
            "xPosition": "10",
            "yPosition": y,
            "height": "10",
            "font": "calibri",
            "bold": "false",
            "italic": "false",
            "underline": "false",
            "fontColor": "black",
            "fontSize": "size8",
            "required": false,
            "recipientId": recipientId
          };
          switch (map[userKey]) {
            case 'text':
              tbs['tabLabel'] = "text_" + userKey;
              tbs['value'] = userKey;
              tbs['width'] = 300;
              textTabs.push(tbs);
              break;
            case 'list':
              tbs['tabLabel'] = "list_" + userKey;
              tbs['value'] = "";
              tbs['width'] = 300;
              listTabs.push(tbs);
              break;
            case 'check':
              tbs['tabLabel'] = "check_" + userKey;
              tbs['selected'] = false;
              checkTabs.push(tbs);
              break;
            case 'note':
              tbs['tabLabel'] = "note_" + userKey;
              tbs['value'] = userKey;
              tbs['width'] = 300;
              noteTabs.push(tbs);
              break;
            default:
          }
          tbs['value'] = userKey;
        }
        role['tabs'] = { "textTabs": textTabs, "listTabs": listTabs, "checkboxTabs": checkTabs, "noteTabs": noteTabs };
      }
      data['recipients']['inPersonSigners'].push(role);
    });
    this.docuSign.createTemplate(data).then(response => {
      console.log(response)
      loader.dismiss();
    }, error => {
      console.error(error);
      loader.dismiss();
    })
  }
}
