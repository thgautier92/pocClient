import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Rx';

@Injectable()
export class UploadService {
  progress: any;
  progressObserver: any;
  constructor() {
    this.progress = Observable.create(observer => {
      console.log("Obs", observer);
      this.progressObserver = observer
    }).share();
  }

  makeFileRequest(url: string, credentials: Object, params: string[], files: File[]) {
    return Observable.create(observer => {
      let formData: FormData = new FormData();
      let xhr: XMLHttpRequest = new XMLHttpRequest();
      formData.append("file", files[0].name)
      formData.append("name", "test");
      xhr.onreadystatechange = () => {
        if (xhr.readyState === 4) {
          if (xhr.status === 200) {
            observer.next(JSON.parse(xhr.response));
            observer.complete();
          } else {
            observer.error(xhr.response);
          }
        }
      };
      xhr.upload.onprogress = (event) => {
        console.log(event);
        this.progress = Math.round(event.loaded / event.total * 100);
        //this.progressObserver.next(this.progress);
      };
      xhr.open('POST', url, true);
      xhr.setRequestHeader('authorization', 'Basic ' + window.btoa(credentials['user'] + ':' + credentials['password']));
      xhr.setRequestHeader("enctype", "multipart/form-data");
      xhr.setRequestHeader("cache-control", "no-cache");
      xhr.withCredentials = true;
      xhr.send(formData);
    });
  }
}
