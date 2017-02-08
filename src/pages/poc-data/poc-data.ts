import { Component } from '@angular/core';
import { NavController, ToastController, Events } from 'ionic-angular';
import { CouchDbServices } from '../../providers/couch/couch';
import { PocDataDetail } from '../poc-data-detail/poc-data-detail';

/*
  Generated class for the PocData page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/
@Component({
  selector: 'page-poc-data',
  templateUrl: 'poc-data.html'
})
export class PocData {
  params: any;
  lstUseCase: any = [];
  displayData: boolean = false;
  constructor(public navCtrl: NavController, public toastCtrl: ToastController, public events: Events, public couch: CouchDbServices) {
    this.events.subscribe("usecase_saved", data => {
      this.getUseCases();
    })
  }

  ionViewDidLoad() {
    console.log('Hello PocData Page');
  }

  ngOnInit() {
    this.couch.getParams().then(data => {
      console.log("Params", data);
      this.params = data;
      this.getUseCases();
    }).catch(error => {
      this.params = null;
      this.getUseCases();
    })
  }
  getUseCases() {
    this.couch.getDbViewDocs('poc_data', 'allDocs', null, 500, 0, this.params).then(response => {
      console.log(response);
      this.lstUseCase = response['rows'];
    }, error => {
      console.error(error);
      let toast = this.toastCtrl.create({
        message: 'Erreur de lecture des cas de test',
        duration: 3000
      });
      toast.present();
    })
  }
  selectUseCase(us) {
    console.log(us);
    this.navCtrl.push(PocDataDetail, us.value);
  }
  addUseCase() {
    this.navCtrl.push(PocDataDetail, this.params);
  }
  removeUseCase(us, idx) {
    this.couch.deleteDoc('poc_data', us['value']['_rev'], us, this.params).then(response => {
      this.lstUseCase.splice(idx, 1);
      let toast = this.toastCtrl.create({
        message: 'Cas supprimé.',
        duration: 3000
      });
      toast.present();

    }, error => {
      console.log("ERR DELETE DATA", error);
      let toast = this.toastCtrl.create({
        message: 'Erreur de suppression',
        duration: 3000
      });
      toast.present();
    });;
  }
}