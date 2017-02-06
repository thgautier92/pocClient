import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import 'rxjs/add/operator/map';

import { FileOpener } from 'ionic-native';
import { File } from 'ionic-native';
import { Transfer } from 'ionic-native';


declare var cordova: any;
//const fs: string = cordova.file.dataDirectory;

/*
  Generated class for the FilesOperation provider.

  See https://angular.io/docs/ts/latest/guide/dependency-injection.html
  for more info on providers and Angular 2 DI.
*/
@Injectable()
export class FilesOperation {
  tempDir: any;
  constructor(public http: Http) {
    console.log('Hello FilesOperation Provider');
    this.tempDir = "C:/TEMP";
  }
  verifTemp() {
    //return fs;
    return (File.getFreeDiskSpace());
  }

  saveFile(fileName, data) {
    //let p = this.tempDir + "/" + fileName;

  }
  openUrlFile() {
    console.log("Open file with plugin");
    let url = "http://gautiersa.fr/codiad/workspace/projets/api/v2/demo/demoFpdfp.php";
    FileOpener.open(url, "application/pdf");
  }
  downloadFile(url?) {
    return new Promise((resolve, reject) => {
      if (!url) url = "http://gautiersa.fr/api/v2/demo/demoFpdfp.php";
      //console.log("Download file and open", url);
      const fileTransfer = new Transfer();
      fileTransfer.download(url, cordova.file.dataDirectory + 'file.pdf').then((entry) => {
        console.log('download complete: ' + entry.toURL());
        FileOpener.open(entry.toURL(), "application/pdf");
        resolve(entry);
      }, (error) => {
        /* handle error
        1 = FileTransferError.FILE_NOT_FOUND_ERR
        2 = FileTransferError.INVALID_URL_ERR
        3 = FileTransferError.CONNECTION_ERR
        4 = FileTransferError.ABORT_ERR
        5 = FileTransferError.NOT_MODIFIED_ERR
        */
        reject(error);
      });
    });
  }
  openDownloadedPdf(dataObj) {
    return new Promise((resolve, reject) => {
      if (dataObj) {
        let fileName = "fileSign.pdf";
        File.checkFile(cordova.file.dataDirectory, fileName).then(fileExist => {
          //Remove File
          File.removeFile(cordova.file.dataDirectory, "fileSign.pdf").then(delFileOk => {
            console.log("Delete previous file", delFileOk);
            this.writeFile(fileName, dataObj).then(ok => {
              resolve(ok);
            }, nok => {
              reject(nok);
            })
          }, delFileError => {
            console.log("ERROR Delete previous file", delFileError);
            reject(delFileError);
          });
        }, noFile => {
          this.writeFile(fileName, dataObj).then(ok => {
            resolve(ok);
          }, nok => {
            reject(nok);
          })
        })
      }
    });
  }
  writeFile(name, dataObj) {
    return new Promise((resolve, reject) => {
      File.writeExistingFile(cordova.file.dataDirectory, "fileSign.pdf", dataObj).then(response => {
        let filePath = cordova.file.dataDirectory + 'fileSign.pdf';
        FileOpener.open(filePath, "application/pdf");
        resolve(filePath);
      }, error => {
        console.error(error);
        reject(error);
      })
    });
  }
}

