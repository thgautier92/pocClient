import { Injectable } from '@angular/core';
import { Http, RequestOptions, Headers, Request, RequestMethod, ResponseContentType } from '@angular/http';
import { Platform } from 'ionic-angular';

import 'rxjs/add/operator/map';

@Injectable()
export class DocuSignServices {
    rootApi: any;
    httpApi: Request;
    options: RequestOptions;
    statusCode: any;
    account: any;
    integratorKey: any;
    accountEmail: any;
    constructor(private http: Http, public platform: Platform) {
        this.rootApi = "https://demo.docusign.net/restapi/v2";
        if (this.platform.is('cordova')) {
        } else {
            console.log("LOCATION ", location);
            if (location.hostname == "localhost") {
                this.rootApi = "/docuSign/restApi/v2";
            } else {
            }
        }
        /*
        if (this.platform.is('core')) {
            console.log("Proxy CORS added for Web application");
            this.rootApi = "/docuSign/restApi/v2"; // proxy CORS for Web Application    
        }
        */
        this.accountEmail = "thierry_gautier@groupe-sma.fr";
        let password = "Tga051163";
        this.integratorKey = "TEST-43dd500e-9abc-42da-8beb-3d3f14698fbd";
        this.account = "1549349";
        // Create the comon request header
        let header = "<DocuSignCredentials><Username>" + this.accountEmail + "</Username><Password>" + password + "</Password><IntegratorKey>" + this.integratorKey + "</IntegratorKey></DocuSignCredentials>";
        let httpHeader = new Headers();
        httpHeader.append('Content-Type', 'application/json; charset=utf-8');
        httpHeader.append('X-DocuSign-Authentication', header);
        this.options = new RequestOptions({});
        this.options.headers = httpHeader;
        this.options.withCredentials = true;
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
    getStatus(code) {
        return this.statusCode[code];
    }
    // ===== ACCOUNT INFORMATION ====
    getAccountInfo() {
        return { "accountEmail": this.accountEmail, "integratorKey": this.integratorKey, "account": this.account };
    }
    getAccount() {
        return new Promise((resolve, reject) => {
            var api = "login_information?api_password=false&include_account_id_guid=true&login_settings=all"
            let url = this.rootApi + "/" + api;
            this.options.method = RequestMethod.Get;
            this.options.responseType = ResponseContentType.Json;
            this.http.request(url, this.options)
                .map(res => res.json())
                .subscribe(data => {
                    resolve(data);
                }, error => {
                    console.log("GET error", error);
                    reject(error);
                });
        })
    };
    getBilling() {
        return new Promise((resolve, reject) => {
            var api = "accounts/#account#/billing_plan";
            api = api.replace("#account#", this.account);
            let url = this.rootApi + "/" + api;
            this.options.method = RequestMethod.Get;
            this.options.responseType = ResponseContentType.Json;
            this.http.request(url, this.options)
                .map(res => res.json())
                .subscribe(data => {
                    resolve(data);
                }, error => {
                    console.log("GET error", error);
                    reject(error);
                });
        });
    };
    // ===== LIST OF ENVELOPES BY FOLDER =====
    getListEnv(yearView, monthView, numFolder) {
        return new Promise((resolve, reject) => {
            var dateView = monthView + "/01/" + yearView;
            var lstFolder = ["all", "drafts", "awaiting_my_signature", "completed", "out_for_signature", "sentitems"]
            var folder = lstFolder[numFolder];
            var api = "accounts/#account#/search_folders/" + folder + "?from_date=" + dateView + "&to_date=&start_position=&count=&order=DESC&order_by=sent&include_recipients=true"
            api = api.replace("#account#", this.account);
            let url = this.rootApi + "/" + api;
            this.options.method = RequestMethod.Get;
            this.options.responseType = ResponseContentType.Json;
            this.http.request(url, this.options)
                .map(res => res.json())
                .subscribe(data => {
                    resolve(data);
                }, error => {
                    console.log("GET error", error);
                    reject(error);
                });
        });
    };
    getFolders(numFolder) {
        return new Promise((resolve, reject) => {
            var lstFolder = ["inbox", "draft", "sentitems", "recyclebin"];
            var folder = lstFolder[numFolder];
            var api = "accounts/#account#/folders/" + folder
            api = api.replace("#account#", this.account);
            let url = this.rootApi + "/" + api;
            this.options.method = RequestMethod.Get;
            this.options.responseType = ResponseContentType.Json;
            this.http.request(url, this.options)
                .map(res => res.json())
                .subscribe(data => {
                    resolve(data);
                }, error => {
                    console.log("GET error", error);
                    reject(error);
                });
        });
    }
    // ===== SIGN API =====
    sendSignEnv(dataSend) {
        return new Promise((resolve, reject) => {
            var api = "accounts/#account#/envelopes"
            api = api.replace("#account#", this.account);
            let url = this.rootApi + "/" + api;
            this.options.method = RequestMethod.Post;
            this.options.responseType = ResponseContentType.Json;
            this.options.body = dataSend;
            this.http.request(url, this.options)
                .map(res => res.json())
                .subscribe(data => {
                    resolve(data);
                }, error => {
                    console.log("POST Envelope error", error);
                    reject(error);
                });
        });
    };
    destSignEnv(envelopeId, dataSend) {
        return new Promise((resolve, reject) => {
            var api = "accounts/#account#/envelopes/#envelopeId#/views/recipient"
            api = api.replace("#account#", this.account);
            api = api.replace("#envelopeId#", envelopeId);
            let url = this.rootApi + "/" + api;
            this.options.method = RequestMethod.Post;
            this.options.responseType = ResponseContentType.Json;
            this.options.body = dataSend;
            this.http.request(url, this.options)
                .map(res => res.json())
                .subscribe(data => {
                    resolve(data);
                }, error => {
                    console.log("GET error", error);
                    reject(error);
                });
        });
    };
    senderSignEnv(envelopeId, dataSend) {
        return new Promise((resolve, reject) => {
            var api = "accounts/#account#/envelopes/#envelopeId#/views/sender"
            api = api.replace("#account#", this.account);
            api = api.replace("#envelopeId#", envelopeId);
            let url = this.rootApi + "/" + api;
            this.options.method = RequestMethod.Post;
            this.options.responseType = ResponseContentType.Json;
            this.options.body = dataSend;
            this.http.request(url, this.options)
                .map(res => res.json())
                .subscribe(data => {
                    resolve(data);
                }, error => {
                    console.log("GET error", error);
                    reject(error);
                });
        });
    };
    removeDocFormEnv(envelopeId, refDoc) {
        // DELETE /v2/accounts/{accountId}/envelopes/{envelopeId}/documents
        return new Promise((resolve, reject) => {
            var api = "accounts/#account#/envelopes/#envelopeId#/documents"
            api = api.replace("#account#", this.account);
            api = api.replace("#envelopeId#", envelopeId);
            let dataSend = { "documents": [{ "documentId": refDoc }] };
            let url = this.rootApi + "/" + api;
            this.options.method = RequestMethod.Delete;
            this.options.responseType = ResponseContentType.Json;
            this.options.body = dataSend;
            this.http.request(url, this.options)
                .map(res => res.json())
                .subscribe(data => {
                    resolve(data);
                }, error => {
                    console.log("DELETE DOC error", error);
                    reject(error);
                });
        });
    }
    // ===== DOC SIGNED =====
    getdocSigned(envelopeId) {
        return new Promise((resolve, reject) => {
            var api = "accounts/#account#/envelopes/#envelopeId#/documents/combined?certificate=true&include_metadata=true&language=fr&show_changes=true"
            api = api.replace("#account#", this.account);
            api = api.replace("#envelopeId#", envelopeId);
            let url = this.rootApi + "/" + api;
            this.options.method = RequestMethod.Get;
            this.options.responseType = ResponseContentType.Blob;
            this.http.request(url, this.options)
                .map(res => res.json())
                .subscribe(data => {
                    resolve(data);
                }, error => {
                    console.log("GET error", error);
                    reject(error);
                });
        });
    };
    getdocSignedUrl(envelopeId) {
        return new Promise((resolve, reject) => { });
    }
    getdocSignedData(envelopeId) {
        return new Promise((resolve, reject) => {
            var api = "accounts/#account#/envelopes/#envelopeId#/recipients?include_tabs=true"
            api = api.replace("#account#", this.account);
            api = api.replace("#envelopeId#", envelopeId);
            let url = this.rootApi + "/" + api;
            this.options.method = RequestMethod.Get;
            this.options.responseType = ResponseContentType.Json;
            this.http.request(url, this.options)
                .map(res => res.json())
                .subscribe(data => {
                    resolve(data);
                }, error => {
                    console.log("GET error", error);
                    reject(error);
                });
        });
    };
    getDocEvents(envelopeId) {
        return new Promise((resolve, reject) => {
            var api = "accounts/#account#/envelopes/#envelopeId#/audit_events"
            api = api.replace("#account#", this.account);
            api = api.replace("#envelopeId#", envelopeId);
            let url = this.rootApi + "/" + api;
            this.options.method = RequestMethod.Get;
            this.options.responseType = ResponseContentType.Json;
            this.http.request(url, this.options)
                .map(res => res.json())
                .subscribe(data => {
                    resolve(data);
                }, error => {
                    console.log("GET error", error);
                    reject(error);
                });
        });
    }
    getDocFromEnv(envelopeId) {
        return new Promise((resolve, reject) => {
            var api = "accounts/#account#/envelopes/#envelopeId#/documents"
            api = api.replace("#account#", this.account);
            api = api.replace("#envelopeId#", envelopeId);
            let url = this.rootApi + "/" + api;
            this.options.method = RequestMethod.Get;
            this.options.responseType = ResponseContentType.Json;
            this.http.request(url, this.options)
                .map(res => res.json())
                .subscribe(data => {
                    resolve(data);
                }, error => {
                    console.log("GET error", error);
                    reject(error);
                });
        });
    }

    // ===== TEMPLATES =====
    getTemplates() {
        return new Promise((resolve, reject) => {
            var api = "accounts/#account#/templates"
            api = api.replace("#account#", this.account);
            let url = this.rootApi + "/" + api;
            this.options.method = RequestMethod.Get;
            this.options.responseType = ResponseContentType.Json;
            this.http.request(url, this.options)
                .map(res => res.json())
                .subscribe(data => {
                    resolve(data);
                }, error => {
                    console.log("GET error", error);
                    reject(error);
                });
        });
    };
    getModelProcess(template) {
        return new Promise((resolve, reject) => {
            var api = "accounts/#account#/templates/#template#/recipients";
            api = api.replace("#account#", this.account);
            api = api.replace("#template#", template);
            let url = this.rootApi + "/" + api;
            this.options.method = RequestMethod.Get;
            this.options.responseType = ResponseContentType.Json;
            this.http.request(url, this.options)
                .map(res => res.json())
                .subscribe(data => {
                    resolve(data);
                }, error => {
                    console.log("GET error", error);
                    reject(error);
                });
        });
    };
    getModelFields(template, recipientId) {
        return new Promise((resolve, reject) => {
            var api = "accounts/#account#/templates/#template#/recipients/" + recipientId + "/tabs";
            api = api.replace("#account#", this.account);
            api = api.replace("#template#", template);
            let url = this.rootApi + "/" + api;
            this.options.method = RequestMethod.Get;
            this.options.responseType = ResponseContentType.Json;
            this.http.request(url, this.options)
                .map(res => res.json())
                .subscribe(data => {
                    resolve(data);
                }, error => {
                    console.log("GET error", error);
                    reject(error);
                });
        });
    };
    getModelDocument(template) {
        return new Promise((resolve, reject) => {
            var api = "accounts/#account#/templates/#template#/documents";
            api = api.replace("#account#", this.account);
            api = api.replace("#template#", template);
            let url = this.rootApi + "/" + api;
            this.options.method = RequestMethod.Get;
            this.options.responseType = ResponseContentType.Json;
            this.http.request(url, this.options)
                .map(res => res.json())
                .subscribe(data => {
                    resolve(data);
                }, error => {
                    console.log("GET error", error);
                    reject(error);
                });
        });
    };
    createTemplate(dataTemplate) {
        // POST accounts/{accountId}/templates
        return new Promise((resolve, reject) => {
            var api = "accounts/#account#/templates/#templateId#/recipients"
            api = api.replace("#account#", this.account);
            let url = this.rootApi + "/" + api;
            this.options.method = RequestMethod.Post;
            this.options.responseType = ResponseContentType.Json;
            this.options.body = dataTemplate;
            this.http.request(url, this.options)
                .map(res => res.json())
                .subscribe(data => {
                    resolve(data);
                }, error => {
                    console.log("Post Template error", error);
                    reject(error);
                });
        });

    }
    createRole(templateId, role) {
        // POST /v2/accounts/{accountId}/templates/{templateId}/recipients
        return new Promise((resolve, reject) => {
            var api = "accounts/#account#/templates/#templateId#/recipients"
            api = api.replace("#account#", this.account);
            api = api.replace("#templateId#", templateId);
            let url = this.rootApi + "/" + api;
            this.options.method = RequestMethod.Post;
            this.options.responseType = ResponseContentType.Json;
            this.options.body = {
                "inPersonSigners": [
                    { "recipientId": "123", "roleName": role }
                ]
            };
            this.http.request(url, this.options)
                .map(res => res.json())
                .subscribe(data => {
                    resolve(data);
                }, error => {
                    console.log("Post Role error", error);
                    reject(error);
                });
        });
    }
    createFielByRole(templateId, roleId, fields) {
        // [{"role":"","fields":[{}]}]
        // POST /v2/accounts/{accountId}/templates/{templateId}/recipients
        // Create tabs
        // POST accounts/{accountId}/templates/{templateId}/recipients/{recipientId}/tabs
        return new Promise((resolve, reject) => {
            var api = "accounts/#account#/templates/#templateId#/recipients/#recipientId#/tabs"
            api = api.replace("#account#", this.account);
            api = api.replace("#templateId#", templateId);
            api = api.replace("#recipientId#", roleId);
            let url = this.rootApi + "/" + api;
            this.options.method = RequestMethod.Post;
            this.options.responseType = ResponseContentType.Json;
            this.options.body = fields;
            this.http.request(url, this.options)
                .map(res => res.json())
                .subscribe(data => {
                    resolve(data);
                }, error => {
                    console.log("Post Fields error", error);
                    reject(error);
                });
        });

    }
    //https://demo.docusign.net/restapi/v2/accounts/1549349/templates/81d3832f-7e34-45f5-bcfc-4e103a682cbc/recipients
    //https://demo.docusign.net/restapi/v2/accounts/1549349/billing_plan 
}