import { Pipe, PipeTransform } from '@angular/core';

/*
  Generated class for the Common pipe.

  See https://angular.io/docs/ts/latest/guide/pipes.html for more info on
  Angular 2 Pipes.
*/
@Pipe({ name: 'objToArray', pure: false })
export class ValuesPipe implements PipeTransform {
  transform(dict: Object): any {
    var a = [];
    for (var key in dict) {
      if (dict.hasOwnProperty(key)) {
        a.push({ key: key, value: dict[key] });
        //console.log(key,dict[key]);
      }
    }
    return a;
  }
}
@Pipe({ name: 'binaryData' })
export class binaryData {
  // Transform is the new "return function(value, args)" in Angular 1.x
  transform(value, mime?) {
    var file = new Blob([value], { type: mime[0] });
    //var retUrl = URL.createObjectURL(file);
    return file
  }
}
@Pipe({ name: 'groupBy' })
export class groupBy implements PipeTransform {
  transform(collection: any, getter: any, subgetter?: any, ssubgetter?: any, sub?: number): any {
    var result = {};
    var prop;
    for (var elm in collection) {
      prop = collection[elm][getter];
      if (subgetter) prop = prop[subgetter];
      if (ssubgetter) prop = prop[ssubgetter];
      if (sub) prop = prop.substring(0, sub);
      //console.log("GROUP BY:", collection, elm, getter, prop);
      if (!result[prop]) {
        result[prop] = [];
      }
      result[prop].push(collection[elm]);
    };
    return result;
  }
}
@Pipe({ name: 'sortBy' })
export class sortBy {
  transform(array: Array<string>, args: string): Array<string> {
    array.sort((a: any, b: any) => {
      if (a[args] < b[args]) {
        return -1;
      } else if (a[args] > b[args]) {
        return 1;
      } else {
        return 0;
      }
    });
    return array;
  }
}
@Pipe({ name: 'keys' })
export class KeysPipe implements PipeTransform {
  transform(value, args: string[]): any {
    let keys = [];
    for (let key in value) {
      keys.push({ key: key, value: value[key] });
    }
    return keys;
  }
}
@Pipe({ name: 'keysAndFilter' })
export class KeysAndFilterPipe implements PipeTransform {
  // ARgs :array of key to exclude
  transform(value, args: string): any {
    let keys = [];
    for (let key in value) {
      if (!args.includes(key)) {
        keys.push({ key: key, value: value[key] });
      }
    }
    return keys;
  }
}
@Pipe({ name: 'textToDate' })
export class textToDate implements PipeTransform {
  transform(value): any {
    // 2016-07-14 02:23:03
    let ret = {};
    let d = (value.substring(0, 10));
    let t = (value.substring(11, 20));
    ret = { "date": d, "time": t };
    return ret;
  }
}
@Pipe({ name: 'filterBy' })
export class filterByPipe implements PipeTransform {
  transform(array: Array<string>, field: string, value?: string): Array<string> {
    let ret = array;
    if (value) {
      ret = array.filter(item => item[field] == value);
    }
    return ret;
  }
}
