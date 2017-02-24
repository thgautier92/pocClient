import { Component, ViewChild, ElementRef, Input } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';


/*
  Generated class for the Pdf component.

  See https://angular.io/docs/ts/latest/api/core/index/ComponentMetadata-class.html
  for more info on Angular 2 Components.
*/
@Component({
  selector: 'pdf',
  templateUrl: 'pdf.html'
})
export class PdfComponent {
  @Input() pdfSrc: any;
  page: number = 1;
  totalPages: number = 0;
  zoom: number = 1.00;
  showAll: boolean = true;
  showSize: boolean = true;
  constructor(public navCtrl: NavController, public navParamsCtrl: NavParams) {
    console.log(navParamsCtrl);
    console.log('Hello Pdf Component');
    //url: 'https://vadimdez.github.io/ng2-pdf-viewer/pdf-test.pdf'
    this.pdfSrc = {
      url: this.navParamsCtrl['data']
    };
    this.totalPages = 0;
  }
  displayAll() {
    this.showAll = !this.showAll;
  }
  displaySize() {
    this.showSize = !this.showSize;
  }
  pdfData(pdfFile: any) {
    this.totalPages = pdfFile['pdfInfo']['numPages'];;
    console.log(pdfFile, this.totalPages);
  }
  zoomReset() {
    this.zoom = 1;
  }
  zoomIn() {
    this.zoom = this.zoom + 0.01;
  }
  zoomOut() {
    this.zoom = this.zoom - 0.01;
  }
  pdfStart() {
    this.page = 1;
  }
  pdfEnd() {
    this.page = this.totalPages;
  }
  pdfPrevious() {
    this.page = this.page - 1;
    if (this.page <= 0) this.page = 1
  }
  pdfNext() {
    this.page = this.page + 1;
    //if (this.page > this.totalPages) this.page = 1;
  }
}
