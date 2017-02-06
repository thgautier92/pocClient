
// this is a custom dictionary to make it easy to extend/override
// provide a name for an entry, it can be anything such as 'copyAssets' or 'copyFonts'
// then provide an object with a `src` array of globs and a `dest` string
/*
src: ['{{ROOT}}/node_modules/ibm-mfp-web-sdk/lib/analytics/ibmmfpfanalytics.js',
      '{{ROOT}}/node_modules/ibm-mfp-web-sdk/ibmmfpf.js',
      '{{ROOT}}/node_modules/ibm-mfp-web-sdk/lib/messages/fr-FR/messages.json'
    ],
    dest: '{{BUILD}}'
*/

module.exports = {
  copyAssets: {
    src: ['{{SRC}}/assets/**/*'],
    dest: '{{WWW}}/assets'
  },
  copyIndexContent: {
    src: ['{{SRC}}/index.html', '{{SRC}}/manifest.json', '{{SRC}}/service-worker.js'],
    dest: '{{WWW}}'
  },
  copyFonts: {
    src: ['{{ROOT}}/node_modules/ionicons/dist/fonts/**/*', '{{ROOT}}/node_modules/ionic-angular/fonts/**/*'],
    dest: '{{WWW}}/assets/fonts'
  },
  copyPolyfills: {
    src: ['{{ROOT}}/node_modules/ionic-angular/polyfills/polyfills.js'],
    dest: '{{BUILD}}'
  },
  copySwToolbox: {
    src: ['{{ROOT}}/node_modules/sw-toolbox/sw-toolbox.js'],
    dest: '{{BUILD}}'
  },
  copyAdditional: {
    src: ['{{ROOT}}/node_modules/json-formatter-js/dist/json-formatter.js',
      '{{ROOT}}/node_modules/json-formatter-js/dist/json-formatter.js.map',
      '{{ROOT}}/node_modules/chance/dist/chance.min.js',
      '{{ROOT}}/node_modules/chart.js/dist/Chart.bundle.js',
      '{{ROOT}}/node_modules/pouchdb/dist/pouchdb.min.js'
    ],
    dest: '{{BUILD}}'
  },
  copyMfp: {
    src: ['{{ROOT}}/node_modules/ibm-mfp-web-sdk/**/*'],
    dest: '{{WWW}}/assets/mfp'
  },
  copyMfpDep1: {
    src: ['{{ROOT}}/node_modules/sjcl/**/*'],
    dest: '{{WWW}}/assets/mfp/node_modules/sjcl'
  },
  copyMfpDep2: {
    src: ['{{ROOT}}/node_modules/jssha/**/*'],
    dest: '{{WWW}}/assets/mfp/node_modules/jssha'
  }
}