import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Rx';
import { DomSanitizer } from '@angular/platform-browser';
import { Http, RequestOptions, Headers, Request, RequestMethod, ResponseContentType } from '@angular/http';
import { Platform, Events } from 'ionic-angular';
import * as xml2js from 'xml2js';

import 'rxjs/add/operator/map';
/* API List
offerCode=SMABTP-TEST
/Contralia/api/v2/<offerCode>/transactions
*/
@Injectable()
export class DocapostServices {
    progress$: any;
    progress: number = 0;
    progressObserver: any;

    httpApi: Request;
    options: RequestOptions;
    optionsPdf: RequestOptions;
    lstApi: any = [];
    statusCode: any;
    account: any;
    settings: any;
    offre: any;
    constructor(private http: Http, public platform: Platform, private sanitizer: DomSanitizer, public events: Events) {
        this.progress$ = new Observable(observer => {
            this.progressObserver = observer
        });
        this.settings = {
            "rootApi": "https://test.contralia.fr/Contralia/api/v2",
            "rootEdoc": "https://test.contralia.fr/eDoc",
            "offre": "SMABTP-TEST",
            "distributeur": "SMABTP-TEST-DISTRIB",
            "referenceFournisseur": "ARC",
            "user": "smabtp-test",
            "password": "smabtp@test2016"
        };
        if (this.platform.is('cordova')) {
        } else {
            //console.log("LOCATION ", location);
            if (location.hostname == "localhost") {
                this.settings['rootApi'] = "/Contralia/api/v2";
                this.settings['rootEdoc'] = "/eDoc";
            } else {
            }
        }
        // Create the comon request header
        let httpHeader = new Headers();
        httpHeader.delete('Authorization');
        httpHeader.append('Authorization', 'Basic ' + window.btoa(this.settings['user'] + ':' + this.settings['password']));
        httpHeader.append('Content-Type', 'application/json; charset=utf-8');
        this.options = new RequestOptions({});
        this.options.headers = httpHeader;
        //this.options.withCredentials = true;

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
                "correct": "correcte"
            };
    }
    public getObserver(): Observable<number> {
        return this.progress$;
    }
    getSettings() {
        return this.settings;
    }
    init(dataSend?) {
        return new Promise((resolve, reject) => {
            if (!dataSend) {
                dataSend = {
                    "offerCode": this.settings['offre'],
                    "organizationalUnitCode": this.settings['distributeur'],
                    "customRef": this.settings['referenceFournisseur'],
                    "requestReference": ""
                };
            }
            let urlParameters = Object.keys(dataSend).map((i) => i + '=' + dataSend[i]).join('&');
            let url = this.settings['rootApi'] + "/" + this.settings['offre'] + "/transactions?" + urlParameters;
            this.options.method = RequestMethod.Post;
            this.options.responseType = ResponseContentType.Text;
            //this.options.body = dataSend;
            this.http.request(url, this.options)
                .subscribe(data => {
                    xml2js.parseString(data['_body'], function (err, result) {
                        resolve(result);
                    });
                }, error => {
                    console.log("API error", error);
                    reject(error);
                });
        });
    }
    status(id) {
        //Contralia/api/v2/transactions/<id>
        return new Promise((resolve, reject) => {
            let url = this.settings['rootApi'] + "/transactions/" + id;
            this.options.method = RequestMethod.Get;
            this.options.responseType = ResponseContentType.Text;
            this.http.request(url, this.options)
                .subscribe(data => {
                    xml2js.parseString(data['_body'], function (err, result) {
                        resolve(result);
                    });
                }, error => {
                    console.log("API error", error);
                    reject(error);
                });
        });
    }
    sendFile(id, fileSend) {
        //console.log(fileSend);
        return Observable.create(observer => {
            let url = this.settings['rootApi'] + "/transactions/" + id + "/document";
            let xhr: XMLHttpRequest = new XMLHttpRequest();
            xhr.withCredentials = true;
            xhr.onreadystatechange = () => {
                if (xhr.readyState === 4) {
                    if (xhr.status === 200) {
                        xml2js.parseString(xhr.response, function (err, result) {
                            observer.next(result);
                            observer.complete();
                        });
                    } else {
                        observer.error(xhr.response);
                    }
                }
            };
            DocapostServices.setUploadUpdateInterval(500)
            xhr.upload.onprogress = (event) => {
                this.progress = Math.round(event.loaded / event.total * 100);
                this.progressObserver.next(this.progress);
            };
            let formData: FormData = new FormData();
            //formData.append("id", id);
            formData.append("file", fileSend[0], fileSend[0]['name']);
            formData.append("name", fileSend[0]['name']);
            xhr.open('POST', url, true);
            xhr.setRequestHeader('authorization', 'Basic ' + window.btoa(this.settings['user'] + ':' + this.settings['password']));
            xhr.setRequestHeader("enctype", "multipart/form-data");
            xhr.setRequestHeader("cache-control", "no-cache");
            xhr.send(formData);
        });
    }
    addSignatory(id, position?, dataSend?) {
        ///Contralia/api/v2/transactions/<id>/signatory/<position>
        return new Promise((resolve, reject) => {
            if (!position) {
                position = 0;
            }
            if (!dataSend) {
                dataSend = {
                    "id": id,
                    "position": 0,
                    "lastname": "GAUTIER",
                    "firstname": "Doc"
                };
            } else {
                //console.log(dataSend);
            }
            let urlParameters = Object.keys(dataSend).map((i) => i + '=' + dataSend[i]).join('&');
            let url = this.settings['rootApi'] + "/transactions/" + id + "/signatory/" + position + "?" + urlParameters;
            this.options.method = RequestMethod.Post;
            this.options.responseType = ResponseContentType.Text;
            this.http.request(url, this.options)
                .subscribe(data => {
                    xml2js.parseString(data['_body'], function (err, result) {
                        resolve(result);
                    });
                }, error => {
                    xml2js.parseString(error['_body'], function (err, result) {
                        console.log(result);
                        reject(result);
                    });
                });
        });
    }
    // ===== API EDOC ======================================================================
    createDoc(templateId, name, dataSign?) {
        // /eDoc/api/document/signUrl
        return new Promise((resolve, reject) => {
            let dataSend = {
                "templateId": templateId,
                "name": name,
                "isTemplate": false,
            }
            if (dataSign) {
                dataSend['jsonMetadata'] = JSON.stringify(dataSign);
            }
            let urlParameters = Object.keys(dataSend).map((i) => i + '=' + dataSend[i]).join('&');
            let url = this.settings['rootEdoc'] + "/api/document?" + urlParameters;
            this.options.method = RequestMethod.Post;
            this.options.responseType = ResponseContentType.Text;
            this.http.request(url, this.options)
                .subscribe(data => {
                    xml2js.parseString(data['_body'], function (err, result) {
                        resolve(result);
                    });
                }, error => {
                    xml2js.parseString(error['_body'], function (err, result) {
                        console.log(result);
                        reject(result);
                    });
                });
        });
    }
    getsignUrl(id) {
        // /eDoc/api/document/signUrl
        return new Promise((resolve, reject) => {
            let dataSend = {
                "transactionId": id,
                "doneUrl": "http://gautiersa.fr/vie/docapostReturn"
            }
            let urlParameters = Object.keys(dataSend).map((i) => i + '=' + dataSend[i]).join('&');
            let url = this.settings['rootEdoc'] + "/api/document/signUrl?" + urlParameters;
            this.options.method = RequestMethod.Post;
            this.options.responseType = ResponseContentType.Text;
            this.http.request(url, this.options)
                .subscribe(data => {
                    xml2js.parseString(data['_body'], function (err, result) {
                        resolve(result);
                    });
                }, error => {
                    xml2js.parseString(error['_body'], function (err, result) {
                        console.log(result);
                        reject(result);
                    });
                });
        });
    }
    getPdfUrl(idDoc) {
        //document/getPdfUrl
        return new Promise((resolve, reject) => {
            /*
            let dataSend = {
                "id": idDoc
            }
            let urlParameters = Object.keys(dataSend).map((i) => i + '=' + dataSend[i]).join('&');
            let url = this.settings['rootEdoc'] + "/api/document/" + idDoc + "/signablePdfUrl?" + urlParameters;
            */
            let url = this.settings['rootEdoc'] + "/api/document/" + idDoc + "/signablePdfUrl"
            this.options.method = RequestMethod.Get;
            this.options.responseType = ResponseContentType.Text;
            this.http.request(url, this.options)
                .subscribe(data => {
                    xml2js.parseString(data['_body'], function (err, result) {
                        resolve(result);
                    });
                }, error => {
                    xml2js.parseString(error['_body'], function (err, result) {
                        console.log(result);
                        reject(result);
                    });

                });
        });
    }
    getPdf(idDoc) {
        //document/getPdfUrl
        return new Promise((resolve, reject) => {
            /*
            let dataSend = {
                "id": idDoc
            }
            let urlParameters = Object.keys(dataSend).map((i) => i + '=' + dataSend[i]).join('&');
            let url = this.settings['rootEdoc'] + "/api/document/" + idDoc + "/signablePdfUrl?" + urlParameters;
            */
            let url = this.settings['rootEdoc'] + "/api/document/" + idDoc + "/signablePdf?asAttachment=false"
            this.options.method = RequestMethod.Get;
            this.options.responseType = ResponseContentType.Blob;
            this.http.request(url, this.options)
                .subscribe(data => {
                    resolve(data['_body']);
                }, error => {
                    xml2js.parseString(error['_body'], function (err, result) {
                        console.log(result);
                        reject(result);
                    });

                });
        });
    }
    attachPdfToTransaction(id, file, name) {
        return Observable.create(observer => {
            let url = this.settings['rootApi'] + "/transactions/" + id + "/document";
            let xhr: XMLHttpRequest = new XMLHttpRequest();
            xhr.withCredentials = true;
            xhr.onreadystatechange = () => {
                if (xhr.readyState === 4) {
                    if (xhr.status === 200) {
                        xml2js.parseString(xhr.response, function (err, result) {
                            observer.next(result);
                            observer.complete();
                        });
                    } else {
                        observer.error(xhr.response);
                    }
                }
            };
            DocapostServices.setUploadUpdateInterval(500)
            xhr.upload.onprogress = (event) => {
                this.progress = Math.round(event.loaded / event.total * 100);
                this.progressObserver.next(this.progress);
            };
            let formData: FormData = new FormData();
            //var blob = new Blob([file], { type: "application/pdf" });
            formData.append("file", file, name + ".pdf");
            formData.append("name", name);
            xhr.open('POST', url, true);
            xhr.setRequestHeader('authorization', 'Basic ' + window.btoa(this.settings['user'] + ':' + this.settings['password']));
            xhr.setRequestHeader("enctype", "multipart/form-data");
            xhr.setRequestHeader("cache-control", "no-cache");
            xhr.send(formData);
        });
    }

    private static setUploadUpdateInterval(interval: number): void {
        setInterval(() => { }, interval);
    }
}