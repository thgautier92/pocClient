import { Injectable } from '@angular/core';
import { InAppBrowser } from 'ionic-native';

function _window(): any {
  // return the global native browser window object
  return window;
}
/*
  Generated class for the WinExternal provider.

  See https://angular.io/docs/ts/latest/guide/dependency-injection.html
  for more info on providers and Angular 2 DI.
*/
@Injectable()
export class WinExternal {

  constructor() {
    console.log('Hello WinExternal Provider');
  }
  get nativeWindow(): any {
    return _window();
  }
  openWin(url, name?, options?) {
    if (!name) {
      name = "_blank";
    }
    if (!options) {
      options = "height=800, width=1024, scrollbars=yes,status=yes,location=yes";
    }
    let win = new InAppBrowser(url, name, options);
    //var win = window.open(url, name, options);
    return win;
  }

}
