import { Injectable } from '@angular/core';
import { Http, Request,  Headers } from '@angular/http';
import 'rxjs/add/operator/map';

/*
  APi to test
  http://gsaexp:gsaexp@cdb.gautiersa.fr/poc_data
*/
@Injectable()
export class RestServices {
  credHeaders: Headers;
  constructor(public http: Http) {
    console.log('Hello Rest Provider');
    this.credHeaders = new Headers();
    //this.credHeaders.append('Content-Type', 'application/json');
    this.credHeaders.append('Accept', 'application/json;charset=utf-8');
  }
  load() {
    return new Promise((resolve, reject) => {
      // We're using Angular HTTP provider to request the data,
      // then on the response, it'll map the JSON data to a parsed JS object.
      // Next, we process the data and resolve the promise with the new data.
      this.http.get('https://randomuser.me/api/?results=10')
        .map(res => res.json())
        .subscribe(data => {
          resolve(data);
        }, error => {
          reject(error);
        });
    });
  }
  loadApi(url, method) {
    // Method : 
    // 0 : GET, 1 : POST
    //
    return new Promise((resolve, reject) => {
      console.log("Rest call url", url, method);
      var options = new Request({
        method: method,
        url: url
      });
      this.http.request(options)
        .map(res => res.json())
        .subscribe(
        data => {
          resolve(data);
        }, error => {
          console.log("API Error", error);
          reject(error);
        });
    });
  };
}
