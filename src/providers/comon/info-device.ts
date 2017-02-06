import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import { Platform } from 'ionic-angular';
import 'rxjs/add/operator/map';

/*
  Generated class for the InfoDevice provider.

  See https://angular.io/docs/ts/latest/guide/dependency-injection.html
  for more info on providers and Angular 2 DI.
*/
@Injectable()
export class InfoDevice {
  data: any;
  osType: any;
  deviceType: any;
  constructor(public http: Http, public platform: Platform) {
    console.log('Hello InfoDevice Provider');
    this.data = null;
    this.osType = ['android', 'cordova', 'ios', 'windows'];
    this.deviceType = ['core', 'ipad', 'iphone', 'mobile', 'mobileweb', 'phablet', 'tablet'];
  }
  getDeviceInfos() {
    return new Promise((resolve, reject) => {
      this.data = {};
      let ver = this.platform.versions();
      //console.log(ver);
      let os = [];
      for (let i of this.osType) {
        let v = "";
        if (this.platform.is(i) && (typeof ver[i] !== 'undefined')) {
          v = ver[i]['str'];
        }
        let item = { "type": i, "value": this.platform.is(i), "version": v };
        os.push(item)
      }
      this.data['os'] = os;
      let dev = [];
      for (let i of this.deviceType) {
        let v = "";
        if (this.platform.is(i) && (typeof ver[i] !== 'undefined')) {
          v = ver[i]['str'];
        }
        let item = { "type": i, "value": this.platform.is(i), "version": v };
        dev.push(item);
      }
      this.data['device'] = dev;
      this.data['width'] = this.platform.width();
      this.data['height'] = this.platform.height();
      this.data['versions'] = this.platform.versions();
      resolve(this.data);
    });
  }

}
