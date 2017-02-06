import { Component } from '@angular/core';
import { NavController, ModalController, ToastController, Events } from 'ionic-angular';
import { CouchDbServices } from '../../../providers/couch/couch';
import { ParamsPage } from '../params/params';
declare var Chart: any;

/*
  Generated class for the CouchStats page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/
@Component({
  selector: 'page-couch-stats',
  templateUrl: 'couch-stats.html'
})
export class CouchStatsPage {
  params: any = null;
  msg: any = null;
  displaySelector: any = true;
  debug: boolean = false;
  displayExplain: boolean = true;
  stats: any = null;
  statsDim: any = [];
  generateGraph: any = [];
  graphs: any = [];
  lstCat: any = [];
  cat: any = "";
  labels: any;
  constructor(public navCtrl: NavController,
    public modalCtrl: ModalController, public toastCtrl: ToastController,
    public events: Events,
    private couch: CouchDbServices) {
    this.events.subscribe("ParamsChanged", data => {
      let toast = this.toastCtrl.create({
        message: 'Changement de serveur...',
        duration: 3000
      });
      toast.present();
      this.params = data;
    })
    this.statsDim = [
      {
        "id": 1, "title": "Bases", "type": "bar", "dim": [
          "couchdb.database_reads",
          "couchdb.database_writes"
        ]
      },
      {
        "id": 2, "title": "Documents", "type": "bar", "dim": [
          "couchdb.document_inserts",
          "couchdb.document_writes"
        ]
      }, {
        "id": 3, "title": "Requêtes HTTP", "type": "bar", "dim": [
          "couchdb.httpd.requests",
          "couchdb.httpd.view_reads",
          "couchdb.httpd.aborted_requests",
        ]
      }, {
        "id": 4, "title": "Requêtes HTTP code", "type": "bar", "dim": [
          "couchdb.httpd_status_codes.*"
        ]
      },
      {
        "id": 5, "title": "Mémoire", "type": "bar", "dim": [
          "mem3.shard_cache.eviction",
          "mem3.shard_cache.hit",
          "mem3.shard_cache.miss",
        ]
      },
      {
        "id": 6, "title": "Logs", "type": "bar", "dim": [
          "couch_log.level.*"
        ]
      }];
    this.labels = [];														// array of labels,for x axis
  }

  ionViewDidLoad() {
    console.log('Hello CouchStatsPage Page');
  }
  ngOnInit() {
    this.couch.getParams().then(data => {
      //console.log("Params", data);
      this.params = data;
    }).catch(error => {
      this.params = null;
    })
  }
  doRefresh(refresher?) {
    console.log('Begin async operation', refresher);
    this.getStats().then(() => {
      if (refresher) refresher.complete();
      if (!this.debug) {
        this.genGraph().then((rep) => {
          setTimeout(() => {
            this.displayGraph();
          }, 2000);
        })
      }
    }, err => {
      refresher.complete();
    })
  }
  getStats() {
    return new Promise((resolve, reject) => {
      this.couch.getStats(this.params).then(data => {
        this.stats = data;
        resolve(data);
      }, error => {
        let toast = this.toastCtrl.create({
          message: 'Erreur de lecture des statistiques',
          duration: 3000
        });
        toast.present();
        this.msg = error;
        reject(error);
      })
    });
  }
  genGraph() {
    return new Promise((resolve, reject) => {
      this.generateGraph = [];
      this.statsDim.forEach(graph => {
        var opt = {
          "id": graph['id'],
          "title": graph['title'],
          "explain": [],
          "type": "bar",
          "graphData": {
            labels: [],
            datasets: []
          }
        };
        // Read each dimension
        graph['dim'].forEach(statVar => {
          // Read the data value in Json Tree
          //console.log("Add ", statVar);
          let c = statVar.split(".");
          let codeDim = [];
          if (c[c.length - 1] === "*") {
            // Read all dimension
            c.pop();
            let statVarValue = this.stats;
            c.forEach(d => { statVarValue = statVarValue[d]; })
            for (var x in statVarValue) {
              codeDim.push(x);
            }
          } else {
            // Read last dimension
            codeDim.push(c[c.length - 1]);
            c.pop();
          }
          codeDim.forEach(elt => {
            let statVarValue = this.stats;
            c.forEach(d => { statVarValue = statVarValue[d]; })
            statVarValue = statVarValue[elt];
            //console.log(statVar, statVarValue);
            opt['explain'].push({ "code": elt, "lib": statVarValue['desc'] });
            //opt['graphData']['labels'].push(codeDim);
            // calcul datasets
            var dsData = {
              label: elt,
              backgroundColor: randomColor(),
              borderColor: "rgba(151,187,205,1)",
              hoverBackgroundColor: "rgba(151,187,205,1)",
              hoverBorderColor: "#fff",
              borderWidth: 1,
              data: []
            };
            dsData['data'].push(statVarValue['value']);
            opt.graphData.datasets.push(dsData);
          });
        });
        //console.log(opt);
        this.generateGraph.push(opt);
      });
      resolve(true);
    });
  }
  displayGraph() {
    console.log("Graps to display", this.generateGraph);
    this.generateGraph.forEach((item, id) => {
      var canvas = <HTMLCanvasElement>document.getElementById("canvas_" + item.id);
      var ctx = canvas.getContext('2d');
      switch (item.type) {
        case "bar":
          this.graphs.push(new Chart(ctx, {
            type: "bar",
            data: item.graphData,
            options: {
              responsive: true,
              onAnimationComplete: function () {
                this.showTooltip(this.datasets[0].bars, true)
              },
              showTooltips: true
            }
          }));
          break;
        case "line":
          this.graphs.push(new Chart(ctx).Line(item.graphData, {
            responsive: true
          }));
          break;
        case "Doughnut":
          this.graphs.push(new Chart(ctx).Doughnut(item.graphData, {
            responsive: true,
            tooltipTemplate: "<%= value %>",
            onAnimationComplete: function () {
              this.showTooltip(this.segments, true);
            },
            showTooltips: true
          }));
          break;
        default:
      }
    });
  }
  gotoParams() {
    this.navCtrl.push(ParamsPage);
  }
}
//Common Function
export function randomScalingFactor() {
  return (Math.random() > 0.5 ? 1.0 : -1.0) * Math.round(Math.random() * 100);
};
export function randomColorFactor() {
  return Math.round(Math.random() * 255);
};
export function randomColor() {
  return 'rgba(' + randomColorFactor() + ',' + randomColorFactor() + ',' + randomColorFactor() + ',.7)';
};
