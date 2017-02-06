import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';

declare var jsPDF: any;
declare var html2canvas: any;
declare var html2pdf: any;
/*
  Generated class for the Jspdf page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/
@Component({
  selector: 'page-jspdf',
  templateUrl: 'jspdf.html'
})
export class Jspdf {

  constructor(public navCtrl: NavController) { }

  ionViewDidLoad() {
    console.log('Hello Jspdf Page');
  }
  getPdf(zone) {
    console.log("Generate a pdf");
    var pdf = new jsPDF('p', 'cm', 'A4')

      // source can be HTML-formatted string, or a reference
      // to an actual DOM element from which the text will be scraped.
      //, source = document.getElementById(zone)
      , source = "	<h2>Document HTML</h2><table><tr><td>1.1</td><td>1.2</td></tr><tr><td>2.1</td><td>2.2</td></tr><tr><td>3.1</td><td>3.2</td></tr></table>"

      // we support special element handlers. Register them with jQuery-style
      // ID selector for either ID or node name. ("#iAmID", "div", "span" etc.)
      // There is no support for any other type of selectors
      // (class, of compound) at this time.
      , specialElementHandlers = {
        // element with id of "bypass" - jQuery style selector
        '#bypassme': function (element, renderer) {
          // true = "handled elsewhere, bypass text extraction"
          return true
        }
      }

    let margins = {
      top: 80,
      bottom: 60,
      left: 40,
      width: 522
    };
    // all coords and widths are in jsPDF instance's declared units
    // 'inches' in this case
    pdf.fromHTML(
      source // HTML string or DOM elem ref.
      , margins.left // x coord
      , margins.top // y coord
      , {
        'width': margins.width // max width of content on PDF
        , 'elementHandlers': specialElementHandlers
      },
      function (dispose) {
        // dispose: object with X, Y of the last line add to the PDF
        //          this allow the insertion of new lines after html
        //var blob = pdf.output("dataurlnewwindow");
        //window.open(blob, "_blank");
        pdf.save('Test.pdf');
      },
      margins
    )
  }
  makePdf() {
    var doc = new jsPDF('p', 'cm', 'A4');
    var name = "Test"
    var multiplier = 10;
    doc.setFontSize(12);
    doc.text(20, 20, 'Questions');
    doc.setFontSize(10);
    doc.text(20, 30, 'This belongs to: ' + name);

    for (var i = 1; i <= 12; i++) {
      doc.text(20, 30 + (i * 10), i + ' x ' + multiplier + ' = ___');
    }
    doc.addPage();
    doc.setFontSize(12);
    doc.text(20, 20, 'Réponses');
    doc.setFontSize(10);
    for (var i = 1; i <= 12; i++) {
      doc.text(20, 30 + (i * 10), i + ' x ' + multiplier + ' = ' + (i * multiplier));
    }
    //doc.fromHTML("<b>Text HTML</b><br><table><tr><td>Col1</td><td>Col2</td></table><br><ul><li>Ligne 1</li><li>Ligne 2</li></ul>", 20, 150);
    doc.save('Test.pdf');
    window.open(doc.output('datauristring', "_blank"));
  }
}
