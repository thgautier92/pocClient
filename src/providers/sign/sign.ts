import { Injectable } from '@angular/core';
import { Http, RequestOptions, Headers } from '@angular/http';
import { Platform } from 'ionic-angular';
import 'rxjs/add/operator/map';

/*
  Generated class for the Sign providers.
  DOCUSIGN
  UNIVERSIGN
  LEGALBOX

  See https://angular.io/docs/ts/latest/guide/dependency-injection.html
  for more info on providers and Angular 2 DI.
*/
@Injectable()
export class SignServices {
  rootApi: any;
  httpApi: any;
  params: any;
  constructor(private http: Http, public platform: Platform) {
    this.params = [
      {
        "serv": "docuSign", "params": {
          "rootApi": "https://demo.docusign.net/restapi/v2",
          "corsApi": "/docuSign/restApi/v2",
          "email": "thierry_gautier@groupe-sma.fr",
          "password": "Tga051163",
          "key": "TEST-43dd500e-9abc-42da-8beb-3d3f14698fbd",
          "account": "1549349",
          "auth": "<DocuSignCredentials><Username>#email#</Username><Password>#password#</Password><IntegratorKey>#key#</IntegratorKey></DocuSignCredentials>"
        }, "api": [
          { "id": "login", "lib": "Login", "method": "get", "url": "login_information?api_password=false&include_account_id_guid=true&login_settings=all" },
          { "id": "listTemplate", "lib": "Liste des templates", "method": "get", "url": "accounts/#account#/templates" },
          { "id": "sendEnv", "lib": "Création d'une enveloppe", "method": "post", "url": "accounts/accounts/#account#/envelopes" },
          { "id": 1, "lib": "Identité numérique", "method": "get", "url": "" }]
      },
      { "serv": "univerSign", "params": {}, "api": [] },
      { "serv": "docaPost", "params": {}, "api": [] }];
  }
  getLstParams() {
    return new Promise((resolve, reject) => {
      let lst = [];
      this.params.forEach(element => {
        lst.push(element['serv']);
      });
      resolve(lst);
    });
  }
  getParam(srv) {
    return new Promise((resolve, reject) => {
      let param = this.params.filter(item => item['serv'] === srv);
      if (param.length > 0) {
        resolve(param[0]['params']);
      } else {
        reject("Fournisseur inconnu");
      }
    });
  }
  getApi(srv, idApi?) {
    return new Promise((resolve, reject) => {
      let param = this.params.filter(item => item['serv'] === srv);
      if (param.length > 0) {
        if (idApi) {
          // filter the api
          let api = param[0]['api'].filter(item => item['id'] === idApi);
          if (api.length > 0) {
            resolve(api[0]);
          } else {
            reject("Api inconnu");
          }
        } else {
          resolve(param[0]['api']);
        }
      } else {
        reject("Fournisseur inconnu");
      }
    });
  }
  loadRootApi(srv) {
    return new Promise((resolve, reject) => {
      //let root = "";
      let param = this.params.filter(item => item['serv'] === srv);
      if (param.length > 0) {
        if (this.platform.is('cordova')) {
          resolve(param[0]['params']['rootApi']);
        } else {
          console.log("LOCATION ", location);
          if (location.hostname == "localhost") {
            resolve(param[0]['params']['corsApi']);
          } else {
            resolve(param[0]['params']['rootApi']);
          }
        }
      } else {
        reject("Fournisseur inconnu");
      }
    })
  };
  loadHeader(srv) {
    return new Promise((resolve, reject) => {
      var header = new Headers();
      header.append('Content-Type', 'application/json; charset=utf-8');
      this.getParam(srv).then(response => {
        var auth = response['auth'];
        auth = auth.replace("#email#", response['email']);
        auth = auth.replace("#password#", response['password']);
        auth = auth.replace("#key#", response['key']);
        //console.log("AUTH", auth);
        header.append('X-DocuSign-Authentication', auth);
        //header.append('withCredentials','true');
        resolve(header);
      }, error => {
        reject(error);
      });
    })
  };
  getService(srv) {
    let api = {};
    return new Promise((resolve, reject) => {
      // get the Root Url
      this.loadRootApi(srv).then(response => {
        console.log(response);
        api['url'] = response;
        //load Http header
        this.loadHeader(srv).then(response => {
          console.log("HEADER", response);
          api['header'] = response;
          resolve(api);
        }, error => {
          console.log("Unable to load HEADER " + srv, error);
          reject({});
        });
      }, error => {
        console.log("Unable to load API " + srv);
        reject({});
      });
    });
  }
  callApi(srv, idApi) {
    return new Promise((resolve, reject) => {
      // Load params
      this.getParam(srv).then(apiParam => {
        //console.log("PARAMS", apiParam);
        // Load service
        this.getService(srv).then(api => {
          //console.log("SERVICE", api);
          var options = new RequestOptions({
            headers: api['header']
          });
          // get Api info
          this.getApi(srv, idApi).then(apiResponse => {
            //console.log("API", api);
            let apiUrl = apiResponse['url'];
            apiUrl = apiUrl.replace("#account#", apiParam['account']);
            //Call API
            switch (apiResponse['method']) {
              case 'get':
                this.http.get(api['url'] + "/" + apiUrl, options)
                  .map(res => res.json())
                  .subscribe(data => {
                    resolve(data);
                  }, error => {
                    console.log("GET error", error);
                    reject(error);
                  });
                break;
              case 'post':
                this.http.post(api['url'] + "/" + apiUrl, options)
                  .map(res => res.json())
                  .subscribe(data => {
                    resolve(data);
                  }, error => {
                    console.log("GET error", error);
                    reject(error);
                  });
                break;
              default:
            }
          }, apiError => {
            reject(apiError);
          });
        }, error => {
          console.log("Api Call", error);
        });
      }, apiParamError => {
        reject("Fournisseur inconnu");
      });
    });
  }
  // ===== Specific API for each solution =====
  // ==== DOCUSIGN
  getStatusLib(x) {
    return function (x) {
      var statusCode =
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
      var text = statusCode[x];
      return text ? text : x;
    }
  }
  // ===== DOCAPOST

}
