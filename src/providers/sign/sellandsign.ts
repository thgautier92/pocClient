import { Injectable } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { Http, RequestOptions, Headers, Request, RequestMethod, ResponseContentType } from '@angular/http';
import { Platform } from 'ionic-angular';
import 'rxjs/add/operator/map';
import { Observable } from 'rxjs/Rx';

@Injectable()
export class SellandsignServices {
    host: any;
    refHost: any;
    j_token: any;
    vendor_email: any;
    contract_definition_id: any;
    actor_id: any;
    httpApi: Request;
    options: RequestOptions;
    statusCode: any;
    account: any;
    integratorKey: any;
    accountEmail: any;

    progress$: any;
    progress: number = 0;
    progressObserver: any;
    constructor(private http: Http, public platform: Platform, private sanitizer: DomSanitizer) {
        this.refHost = "http://2.int.dev.calindasoftware.com";
        this.host = "http://2.int.dev.calindasoftware.com";
        this.progress$ = new Observable(observer => {
            this.progressObserver = observer
        });
        if (this.platform.is('cordova')) {
        } else {
            if (location.hostname == "localhost") {
                this.host = "/sellandsign";
            } else {
            }
        }
        this.j_token = "18273645|YdtJpcGNpDjKDBoLSej/pUDAs08JlYgT";
        this.vendor_email = "smabtp_vendor@calindasoftware.com";
        this.contract_definition_id = "1";
        this.actor_id = "37";

        // Create the comon request header
        let httpHeader = new Headers();
        httpHeader.append('Content-Type', 'application/json; charset=utf-8');
        httpHeader.append('j_token', this.j_token);
        this.options = new RequestOptions({});
        this.options.headers = httpHeader;
        //this.options.withCredentials = true;
    }
    public getObserver(): Observable<number> {
        return this.progress$;
    }
    /**
     * Create/Update a client with the data
     * 
     * @param dataSend : json structure 
     */
    createClient(dataSend?) {
        return new Promise((resolve, reject) => {
            if (!dataSend) {
                dataSend = {
                    "number": "",
                    "actorId": 1,
                    "civility": "MONSIEUR",
                    "firstname": "Bernard",
                    "lastname": "Sanders",
                    "address1": "A",
                    "address2": "B",
                    "postalCode": "13100",
                    "city": "PARIS",
                    "phone": "01234567890",
                    "email": "test@calinda.fr",
                    "companyName": "yourcompany",
                    "country": "FR",
                    "cellPhone": "01234567890",
                    "jobTitle": "Director",
                    "registrationNumber": "SIRET",
                    "birthdate": -1,
                    "birthplace": ""
                };
            }
            var api = "calinda/hub/selling/model/customer/update?action=selectOrCreateCustomer";
            let url = this.host + "/" + api;
            this.options.method = RequestMethod.Post;
            this.options.responseType = ResponseContentType.Json;
            this.options.body = dataSend;
            this.http.request(url, this.options)
                .map(res => res.json())
                .subscribe(data => {
                    resolve(data);
                }, error => {
                    console.log("Creating Client error", error);
                    reject(error);
                });
        });
    }
    getOrCreateContractor(customer_number, dataSend?) {
        return new Promise((resolve, reject) => {
            if (!dataSend) {
                dataSend = {
                    "number": "",
                    "actorId": 1,
                    "civility": "MONSIEUR",
                    "firstname": "Bernard",
                    "lastname": "Sanders",
                    "address1": "A",
                    "address2": "B",
                    "postalCode": "13100",
                    "city": "PARIS",
                    "phone": "01234567890",
                    "email": "test@calinda.fr",
                    "companyName": "yourcompany",
                    "country": "FR",
                    "cellPhone": "01234567890",
                    "jobTitle": "Director",
                    "registrationNumber": "SIRET",
                    "birthdate": -1,
                    "birthplace": ""
                };
            } else {
                dataSend['customer_number'] = customer_number;
            }
            var api = "calinda/hub/selling/model/contractor/update?action=getOrCreateContractor";
            let url = this.host + "/" + api;
            this.options.method = RequestMethod.Post;
            this.options.responseType = ResponseContentType.Json;
            this.options.body = dataSend;
            this.http.request(url, this.options)
                .map(res => res.json())
                .subscribe(data => {
                    resolve(data);
                }, error => {
                    console.log("Creating Contractor error", error);
                    reject(error);
                });
        });
    }

    /**
     * Create a contract for a given customer, at a specified date (in milliseconds)
     * 
     * @param customer_number
     * @param date
     */
    createContract(customer_number, date) {
        return new Promise((resolve, reject) => {
            let callData = {
                closed: false,
                customer_entity_id: -1,
                contract_definition_id: this.contract_definition_id,
                customer_number: customer_number,
                date: date,
                filename: "",
                keep_on_move: false,
                vendor_email: this.vendor_email
            };
            var api = "calinda/hub/selling/model/contract/insert?action=createContract";
            let url = this.host + "/" + api;
            this.options.method = RequestMethod.Post;
            this.options.responseType = ResponseContentType.Json;
            this.options.body = callData;
            this.http.request(url, this.options)
                .map(res => res.json())
                .subscribe(data => {
                    resolve(data);
                }, error => {
                    console.log("Creating Contract error", error);
                    reject(error);
                });
        });
    }
    addContractorTo(contract_id, contractor_id, signature_mode) {
        return new Promise((resolve, reject) => {
            var callData = {
                contract_id: contract_id,
                contractor_id: contractor_id,
                signature_mode: signature_mode,
                signature_status: "NONE",
                signature_id: null,
                signature_date: null
            };
            let api = "calinda/hub/selling/model/contractorsforcontract/insert?action=addContractorTo";
            let url = this.host + "/" + api;
            this.options.method = RequestMethod.Post;
            this.options.responseType = ResponseContentType.Json;
            this.options.body = callData;
            this.http.request(url, this.options)
                .map(res => res.json())
                .subscribe(data => {
                    resolve(data);
                }, error => {
                    console.log("AddContratorTo error", error);
                    reject(error);
                });
        });
    }
    uploadContract(contract_id, file, name) {
        console.log("File to upload", file);
        return Observable.create(observer => {
            let url = this.host + "/calinda/hub/selling/do?m=uploadContract&id=" + contract_id + "&j_token=" + encodeURIComponent(this.j_token);
            let xhr: XMLHttpRequest = new XMLHttpRequest();
            //xhr.withCredentials = true;
            xhr.onreadystatechange = () => {
                if (xhr.readyState === 4) {
                    if (xhr.status === 200) {
                        observer.next(xhr.response);
                        observer.complete();
                    } else {
                        observer.error(xhr.response);
                    }
                }
            };
            SellandsignServices.setUploadUpdateInterval(500)
            xhr.upload.onprogress = (event) => {
                this.progress = Math.round(event.loaded / event.total * 100);
                this.progressObserver.next(this.progress);
            };
            let formData: FormData = new FormData();
            formData.append("files[]", file, name);
            //formData.append("name", "files[]");
            xhr.open('POST', url, true);
            //xhr.setRequestHeader("Content-Type", "application/pdf");
            xhr.setRequestHeader("Content-Type", "multipart/form-data;boundary=----WebKitFormBoundaryyEmKNDsBKjB7QEqu");
            //xhr.setRequestHeader("enctype", "multipart/form-data");
            xhr.setRequestHeader("cache-control", "no-cache");
            xhr.send(formData);
        });
    }

    generateTempToken(customer_number, contract_id) {
        return new Promise((resolve, reject) => {
            var callData = {
                actorId: this.actor_id,
                time: new Date().getTime() + 3600 * 1000,
                profile: "sign_contract",
                parameters: {
                    contract_definition_id: this.contract_definition_id,
                    customer_id: customer_number
                }
            };
            let api = "calinda/hub/createTemporaryToken.action";
            let url = this.host + "/" + api;
            this.options.method = RequestMethod.Post;
            this.options.responseType = ResponseContentType.Json;
            this.options.body = callData;
            this.http.request(url, this.options)
                .map(res => res.json())
                .subscribe(data => {
                    let token = encodeURIComponent(data.token.token);
                    let urlReturn = this.refHost + "/calinda/s/sign_contract_index.html?direct_contract=" + this.contract_definition_id + "&cd_id=1&c_id=" + contract_id + "&page=1&customer_number=" + customer_number + "&j_token=" + token;
                    resolve({ "url": urlReturn });
                }, error => {
                    console.log("Generate Token error", error);
                    reject(error);
                });
        });
    }
    private static setUploadUpdateInterval(interval: number): void {
        setInterval(() => { }, interval);
    }
}