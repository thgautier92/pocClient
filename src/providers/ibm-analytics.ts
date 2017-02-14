import { Injectable } from '@angular/core';
import { Http, Request, RequestMethod, Headers, ResponseContentType } from '@angular/http';
import 'rxjs/add/operator/map';

/*
  Generated class for the IbmAnalytics provider.

  See https://angular.io/docs/ts/latest/guide/dependency-injection.html
  for more info on providers and Angular 2 DI.
*/
@Injectable()
export class IbmAnalytics {
  credHeaders: Headers;
  constructor(public http: Http) {
    console.log('Hello IbmAnalytics Provider');
    this.credHeaders = new Headers();
    this.credHeaders.append('Content-Type', 'application/json');
    this.credHeaders.append('Accept', 'application/json;charset=utf-8');
  }
  getCustomChart(id?) {
    return new Promise((resolve, reject) => {
      let rootUrl = "http://gautiersa.fr:8080/analytics/services/rest/v3/customchart/export/cced8d5581-4b65-4c2a-a13c-47e44b4da6a8?format=json&startDate=*&endDate=*&apiKey=worklight";
      var options = new Request({
        method: RequestMethod.Get,
        headers: this.credHeaders,
        withCredentials: false,
        body: {},
        url: rootUrl
      });
      this.http.request(options)
        .map(res => res.json())
        .subscribe(
        data => {
          resolve(data);
        }, error => {
          console.log("IBM Analytic Server : request error", error);
          reject(error);
        });
    });
  };
}
