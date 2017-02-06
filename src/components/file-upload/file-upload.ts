import { Component } from '@angular/core';
import { Platform, NavController, NavParams, Events, AlertController, LoadingController, ActionSheetController } from 'ionic-angular';

/*
  Generated class for the FileUpload component.

  See https://angular.io/docs/ts/latest/api/core/index/ComponentMetadata-class.html
  for more info on Angular 2 Components.
*/
@Component({
  selector: 'file-upload',
  templateUrl: 'file-upload.html'
})
export class FileUploadComponent {

  imageSrc: any;
  file: File;
  constructor(public platform: Platform,
    public navCtrl: NavController, public navParams: NavParams,
    public events: Events, public alertCtrl: AlertController, public actionSheetCtrl: ActionSheetController,
    public loadingCtrl: LoadingController) {
    console.log('Hello FileUpload Component');
  }
  changeListener($event): void {
    console.log($event);
    this.readThis($event.target);
  }

  readThis(inputValue: any): void {
    this.file = inputValue.files[0];
    console.log(this.file);
    var myReader: FileReader = new FileReader();
    myReader.onloadend = (e) => {
      let binaryString = myReader.result;
      this.imageSrc = btoa(binaryString);
      this.events.publish('fileSelected', { "file": this.file, "data": this.imageSrc });
    }
    //myReader.readAsDataURL(this.file);
    myReader.readAsBinaryString(this.file);
  }
}
