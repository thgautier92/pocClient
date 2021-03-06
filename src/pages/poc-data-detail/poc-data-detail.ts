import { Component, ViewChild } from '@angular/core';
import { NavController, NavParams, ToastController, Events } from 'ionic-angular';
import { CouchDbServices } from '../../providers/couch/couch';

declare var ace: any;
/*
  Generated class for the PocDataDetail page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/
export class useCase {
    _id: string;
    type: string;
    modeProto: boolean;
    name: string;
    title: string;
    description: string;
    dataUseCase: any;
}
@Component({
    selector: 'page-poc-data-detail',
    templateUrl: 'poc-data-detail.html'
})
export class PocDataDetail {
    @ViewChild('editor') editor;
    lstType: any = [];
    params: any;
    dataEdit: any;
    useCaseDetail: useCase;
    text: string = "";
    aceEditor: any;
    okDetail: boolean = false;

    constructor(public navCtrl: NavController, public navParams: NavParams,
        public toastCtrl: ToastController, public events: Events,
        public couch: CouchDbServices) {
        console.log("Params", this.navParams);
        console.log(this.navParams['data']);
        this.params = this.navParams['data']['params'];
        this.dataEdit = this.navParams['data']['data'];
        this.loadUseCaseType();
        /*
        this.couch.getParams().then(data => {
            this.params = data;
            this.loadUseCaseType();
        }).catch(error => {
            this.params = null;
            this.loadUseCaseType();
        })
        */
    }
    ngAfterViewInit() {
    }
    ngOnChanges(changes: any) {
        console.log("CHANGES", changes);
    }
    ionViewDidLoad() {
        console.log('Hello PocDataDetail Page');
    }
    ngOnInit() {
        if (this.dataEdit) {
            this.useCaseDetail = this.dataEdit;
        } else {
            console.log("Create a new use case");
            this.useCaseDetail = new useCase;
            this.useCaseDetail._id = this.couch.guid();
            this.useCaseDetail.modeProto = true;
            this.useCaseDetail.name = "";
            this.useCaseDetail.title = "";
            this.useCaseDetail.description = "";
            this.useCaseDetail.dataUseCase = {};

        }
        this.text = JSON.stringify(this.useCaseDetail['dataUseCase'], null, '\t');
        this.loadEditor(this.text, "editor", "json");
        this.okDetail = true;
    }
    loadUseCaseType() {
        this.couch.getDbViewCount('poc_data', 'countByType', this.params).then(response => {
            this.lstType = response['rows'];
        }, error => {
            console.error(error);
        })
    }
    loadEditor(text, field, mode) {
        this.aceEditor = ace.edit(field);
        this.aceEditor.$blockScrolling = Infinity;
        this.aceEditor.setTheme("ace/theme/eclipse");
        this.aceEditor.getSession().setMode("ace/mode/" + mode);
        this.aceEditor.getSession().setValue(text);
    }
    updateUseCase(evt) {
        console.log("Change Event", evt);
    }
    cancelDetail() {
        this.navCtrl.pop();
    }
    saveDetail() {
        try {
            let t = JSON.parse(this.aceEditor.getSession().getValue());
            this.useCaseDetail['dataUseCase'] = t;
            //console.log(this.useCaseDetail);
            this.couch.addDoc('poc_data', this.useCaseDetail, this.params).then(response => {
                //console.log(response, this.useCaseDetail);
                this.useCaseDetail['_rev'] = response['rev'];
                this.events.publish("usecase_saved");
                let toast = this.toastCtrl.create({
                    message: 'Cas enregistré.',
                    duration: 3000
                });
                toast.present();
            }, error => {
                console.log("ERR save DATA", error);
                let toast = this.toastCtrl.create({
                    message: 'Erreur de sauvegarde',
                    duration: 3000
                });
                toast.present();
            })
        } catch (e) {
            console.log("JSON ERROR", e);
        }
    }
}
