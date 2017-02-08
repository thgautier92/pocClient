import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import { CouchDbServices } from '../../../providers/couch/couch';
declare var pdfMake: any;
/*
  Generated class for the Pdfmake page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/
@Component({
  selector: 'page-pdfmake',
  templateUrl: 'pdfmake.html'
})
export class Pdfmake {
  params: any;
  lstApi: any = [];
  lstUseCase: any = [];
  currentUseCase: any = {};
  docSend: any = {};
  option: any = "fusion";
  constructor(public navCtrl: NavController, public couch: CouchDbServices) {
    this.lstApi = [
      { "code": "creation", "title": "Création d'un document", "method": "" },
      { "code": "fusion", "title": "Fusion de données", "method": "" },
    ];
    this.docSend = { "useCase": "" };
  }

  ngOnInit() {
    this.couch.getParams().then(data => {
      console.log("Params", data);
      this.params = data;
      this.getUseCase();
    }).catch(error => {
      this.params = null;
      this.getUseCase();
    })
    this.getUseCase();
  }
  ionViewDidLoad() {
    console.log('Hello Pdfmake Page');
  }
  getUseCase() {
    this.couch.getDbViewDocs('poc_data', 'byType', 'pdf', 100, 0, this.params).then(response => {
      console.log(response);
      this.lstUseCase = response['rows'];
    }, error => {
      console.log(error)
    });
  }
  updateDocData() {
    let u = this.lstUseCase.filter(item => item['value']['name'] == this.docSend['useCase']);
    this.currentUseCase = u[0]['value'];
    console.log("UseCase selected", this.currentUseCase);
    this.makePdf(this.currentUseCase['dataUseCase']['docDef'], this.currentUseCase['dataUseCase']['clients'][0]);
  }
  makePdf(dataDoc?, dataFields?) {
    console.log(dataDoc, dataFields);
    var docDefinition = {};
    // Content definition
    if (!dataDoc) {
      docDefinition = {
        "content": [
          "First paragraph",
          "Another paragraph, this time a little bit longer to make sure, this line will be divided into at least two lines"
        ]
      };
      dataFields = {};
    } else {
      docDefinition = dataDoc;
    }
    // replace fields
    var docStr = JSON.stringify(docDefinition);
    for (var name in dataFields) {
      console.log("ELT", name, dataFields[name]);
      docStr = docStr.replace(new RegExp('#' + name + '#', 'gi'), dataFields[name]);
    }
    docDefinition = JSON.parse(docStr);
    // Add Footer, Header and background
    docDefinition["footer"] = function (currentPage, pageCount) {
      return {
        text: "Page " + currentPage.toString() + "/" + pageCount,
        alignment: "center"
      };
    };
    docDefinition["header"] = function (currentPage, pageCount) {
      // you can apply any logic and return any valid pdfmake element
      return {
        text: "Groupe SMA",
        alignment: (currentPage % 2) ? "left" : "right"
      };
    };
    docDefinition["background"] = function (currentPage) {
      return {
        text: "Texte de fond sur la page, rouge pages paires" + currentPage,
        alignment: "center",
        color: (currentPage % 2) ? "blue" : "red"
      };
    }
    pdfMake.createPdf(docDefinition).open();
  }

}
