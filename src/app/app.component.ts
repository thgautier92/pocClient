import { Component, ViewChild } from '@angular/core';
import { Nav, Platform } from 'ionic-angular';
import { StatusBar, Splashscreen } from 'ionic-native';

import { Home } from '../pages/home/home';
import { PocData } from '../pages/poc-data/poc-data';
import { About } from '../pages/about/about';
//import { Page1 } from '../pages/page1/page1';
//import { Page2 } from '../pages/page2/page2';
import { Sign } from '../pages/sign/sign';
import { Simu } from '../pages/simu/simu';
import { PdfGen } from '../pages/pdf-gen/pdf-gen';
import { NosqlPage } from '../pages/nosql/nosql';


@Component({
  templateUrl: 'app.html'
})
export class PocApp {
  @ViewChild(Nav) nav: Nav;

  rootPage: any = Home;

  pages: Array<{ title: string, component: any, icon: any, color: any }>;

  constructor(public platform: Platform) {
    this.initializeApp();
    this.pages = [
      { title: 'Accueil', component: Home, icon: "home", color: "standard" },
      { title: 'Signatures', component: Sign, icon: "document", color: "primary" },
      { title: 'Simulateurs', component: Simu, icon: "calculator", color: "primary" },
      { title: 'Générateur PDF', component: PdfGen, icon: "document", color: "primary" },
      { title: 'Bases NOSQL', component: NosqlPage, icon: "document", color: "secondary" },
      { title: 'Cas de tests', component: PocData, icon: "people", color: "secondary" },
      { title: 'A propos', component: About, icon: "information-circle", color: "standard" }
    ];
  }
  initializeApp() {
    this.platform.ready().then(() => {
      // Okay, so the platform is ready and our plugins are available.
      // Here you can do any higher level native things you might need.
      console.info("Platform", this.platform._platforms);
      if (this.platform.is('cordova')) {
        StatusBar.styleDefault();
        Splashscreen.hide();
      }
    });
  }
  openPage(page) {
    this.nav.setRoot(page.component);
  }
}
