import { Injectable } from '@angular/core';
import { NavController, Events } from 'ionic-angular';

/*
  Generated class for the Calculate provider.

  See https://angular.io/docs/ts/latest/guide/dependency-injection.html
  for more info on providers and Angular 2 DI.
*/
@Injectable()
export class CalcTools {

  constructor(public nav: NavController, public events: Events) {
    console.log('Hello Calculate Provider');
  }
  /* ============================================================ 
      * Function to calculate the page status, regarding each form status, included in the page
      *   idPage : the index of the page/tab to update
      *   lstForms : a JSON list of forms included in the page
      *     { "id": 1, "status": "" }
      * 
      * The function push an event "menuStatusChange" at the end of calc
      ================================================================= */
  calcPageStatus(idPage, lstForms) {
    let score = 0;
    let pageStatus = "hold";
    lstForms.forEach(function (item) {
      if (item.status === "completed") score = score + 1
    });
    if (score === lstForms.length) pageStatus = "completed";
    if (score === 0) pageStatus = "hold";
    if (score > 0 && score < lstForms.length) pageStatus = "partial";
    this.events.publish('menuStatusChange', { "id": idPage, "status": pageStatus });
    return true;
  };

}
