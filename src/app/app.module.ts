import { NgModule, ErrorHandler } from '@angular/core';
import { IonicApp, IonicModule, IonicErrorHandler } from 'ionic-angular';
import { Storage } from '@ionic/storage';

import { PocApp } from './app.component';
import { Home } from '../pages/home/home';
import { About } from '../pages/about/about';
import { PocData } from '../pages/poc-data/poc-data';
import { PocDataDetail } from '../pages/poc-data-detail/poc-data-detail';

import { Page1 } from '../pages/page1/page1';
import { Page2 } from '../pages/page2/page2';

//Pipes
import { groupBy, KeysPipe, filterByPipe } from '../pipes/comon';

// Générateur de fichier PDF
import { PdfGen } from '../pages/pdf-gen/pdf-gen';
import { Jspdf } from '../pages/pdf-gen/jspdf/jspdf';
import { Pdfmake } from '../pages/pdf-gen/pdfmake/pdfmake';
import { PdfViewerComponent } from 'ng2-pdf-viewer';

// Signature electronique
import { Sign } from '../pages/sign/sign';
import { Docusign } from '../pages/sign/docusign/docusign';
import { DocuSignModel } from '../pages/sign/docusign/docusignmodel';
import { DocuSignServices } from '../providers/sign/docuSign';
//import { Docapost } from '../pages/sign/docapost/docapost';
//import { DocapostServices } from '../providers/sign/docapost';
//import { SellandsignPage } from '../pages/sign/sellandsign/sellandsign';
//import { SellandsignServices } from '../providers/sign/sellandsign';

// Simulateurs externes
import { Simu } from '../pages/simu/simu';
import { Harvest } from '../pages/simu/harvest/harvest';
import { Epicaste } from '../pages/simu/epicaste/epicaste';

// nosql
import { NosqlPage } from '../pages/nosql/nosql';
import { ParamsPage } from '../pages/nosql/params/params';
import { CouchBasePage, dbPopoverPage } from '../pages/nosql/couch-base/couch-base';
import { CouchStatsPage } from '../pages/nosql/couch-stats/couch-stats';
import { PouchPage, dbPopoverPouchPage } from '../pages/nosql/pouch/pouch';

// Mobile First Platform
import { MfpPage } from '../pages/mfp/mfp';
import { MfpTracePage } from '../pages/mfp/mfp-trace/mfp-trace';
import { MfpApiPage } from '../pages/mfp/mfp-api/mfp-api';
import { MfpInfoPage } from '../pages/mfp/mfp-info/mfp-info';

// openData pages
import { OpendataPage } from '../pages/opendata/opendata';
import { RatpPage } from '../pages/opendata/ratp/ratp';

// components
import { Record } from '../components/record/record';
import { FileUploadComponent } from '../components/file-upload/file-upload';
import { PdfComponent } from '../components/pdf/pdf';
import { CouchCrudComponent, dbEditDataPage } from '../components/couch-crud/couch-crud';
import { PouchCrudComponent, dbEditLocalDataPage } from '../components/pouch-crud/pouch-crud';

// Common providers
import { CouchDbServices } from '../providers/couch/couch';
import { IbmAnalytics } from '../providers/ibm-analytics';
import { RestServices } from '../providers/rest';
import { UploadService } from '../providers/upload';
import { WinExternal } from '../providers/win-external';
import { FilesOperation } from '../providers/files-operation';

@NgModule({
    declarations: [
        PocApp,
        Home, About,
        PocData, PocDataDetail,
        Page1,
        Page2,
        PdfGen, Jspdf, Pdfmake,
        Sign, Docusign, DocuSignModel,
        Simu, Harvest, Epicaste,
        NosqlPage, ParamsPage, CouchBasePage, dbPopoverPage, CouchStatsPage,
        PouchPage, dbPopoverPouchPage,
        MfpPage, MfpTracePage, MfpApiPage, MfpInfoPage,
        OpendataPage, RatpPage,
        Record, FileUploadComponent, PdfViewerComponent, PdfComponent,
        CouchCrudComponent, dbEditDataPage,
        PouchCrudComponent, dbEditLocalDataPage,
        groupBy, KeysPipe, filterByPipe
    ],
    imports: [
        IonicModule.forRoot(PocApp, {
            backButtonText: ''
        })
    ],
    bootstrap: [IonicApp],
    entryComponents: [
        PocApp,
        Home, About,
        PocData, PocDataDetail,
        Page1,
        Page2,
        PdfGen, Jspdf, Pdfmake,
        Sign, Docusign, DocuSignModel,
        Simu, Harvest, Epicaste,
        NosqlPage, ParamsPage, CouchBasePage, dbPopoverPage, CouchStatsPage,
        PouchPage, dbPopoverPouchPage,
        MfpPage, MfpTracePage, MfpApiPage, MfpInfoPage,
        OpendataPage, RatpPage,
        Record, FileUploadComponent, PdfViewerComponent, PdfComponent,
        CouchCrudComponent, dbEditDataPage,
        PouchCrudComponent, dbEditLocalDataPage
    ],
    providers: [
        { provide: ErrorHandler, useClass: IonicErrorHandler },
        Storage,
        RestServices, UploadService, CouchDbServices, WinExternal, FilesOperation,
        DocuSignServices,
        IbmAnalytics
    ]
})
export class AppModule { }
