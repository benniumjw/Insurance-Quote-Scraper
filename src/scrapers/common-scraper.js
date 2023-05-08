import { remote } from 'electron';
var Nightmare = require('nightmare');
var path = require('path');
const isDev = require('electron-is-dev');
const app = remote.app;

import moment from 'moment';
import carScraper from './car-scraper.js';
import homeScraper from './home-scraper.js';

// load electron
var electronPath;
if(isDev) {
  electronPath = require("../node_modules/electron")
} else {
  electronPath = require(path.join(app.getAppPath(), '../', 'electron'));
}

// default, changed by drop down list
var scraper = homeScraper;

// common variables
var showNightmare = false;
var increment = 3;
var counter = 0;
var nextBatch = counter + increment;
var interval = 0;
var batchCounter = 0;
var estimated = 20;
var countdown = estimated;
var callback;
var json = [];
var scraperName = '';
var successCounter = 0;
var errorCounter = 0;
var pendingCounter = 0;
// nightmare variables
var nightmareWaitTimeout = 10000;
var nightmareTypeInterval = 200;
var nightmareGotoTimeout = 10000;
var nightmareExecutionTimeout = 10000;

// common elements
var $detailsElement = document.querySelector('#details');
var $detailsElement2 = document.querySelector('#details2');
var $timeoutElement = document.querySelector('#countdown');

// common actions for nightmare
Nightmare.action('containsClick', function(selector, done) {
    this.evaluate_now((selector) => {
        return $(selector).click();
    }, done, selector)
});


/* PUBLIC for OTHER SCRAPERS */
var createNightmareInstance = function() {
  return new Nightmare({
    electronPath: electronPath,
    show: showNightmare,
    waitTimeout: nightmareWaitTimeout,
    gotoTimeout: nightmareGotoTimeout,
    executionTimeout : nightmareExecutionTimeout,
    ignoreSslErrors: true,
    webSecurity: false
  });
}


/* PUBLIC used by APP.js */
var selectScraper = function(type) {
  if(type === 'car') {
    scraper = carScraper;
  } else {
    scraper = homeScraper;
  }
}

/* PUBLIC used by APP.js */
// 25 sec on average, 3 windows at once
// 2000 entries = 4.5 hours
// set data from JSON
var setData = function(_data, _scraperName, _increment, _showWindows) {
  console.log("RUNNING " + _scraperName)
  json = _data;
  scraperName = _scraperName;
  increment = _increment;
  showNightmare = _showWindows;
  nextBatch = counter + increment;
  if(nextBatch > json.length) {
    nextBatch = json.length;
  }
  if(_scraperName === "AMI") {
    estimated = 25;
  } else if(_scraperName === "STATE") {
    estimated = 25;
  } else if(_scraperName === "AA") {
    estimated = 40;
  } else if(_scraperName === "TOWER") {
    estimated = 20;
  }
  pendingCounter = json.length;
  document.querySelector('#pendingCount').innerHTML = pendingCounter;
}


/* PUBLIC used by APP.js */
// runs the scraper in batches e.g. 2 windows at a time
var runBatch = function(cb) {
    if(cb) {
      callback = cb;
    }
    clearInterval(interval);
    if(counter == json.length) {
      _completeScraper();
      return;
    }
    for(var i = counter; i < nextBatch; i++) {
        if(json[i]) {
            _runNightmare(json, i)
            _updateProgress(i + 1);
        }
    }
    _startCountdown();
    batchCounter++;
}


/* PUBLIC for OTHER SCRAPERS */
// finish method for each window scraping
// runs next batch of processing if all windows done
var endNightmare = function(status) {
  if(status === true) {
    successCounter++;
    document.querySelector('#successCount').innerHTML = successCounter;
  } else {
    errorCounter++;
    document.querySelector('#errorCount').innerHTML = errorCounter;
  }
  pendingCounter--;
  document.querySelector('#pendingCount').innerHTML = pendingCounter;
  counter++;
  if(counter == nextBatch) {
      nextBatch += increment;
      if(nextBatch > json.length) {
        nextBatch = json.length;
      }
      runBatch();
  }
}


/* INTRNAL UTILITIES */
var _updateProgress = function(number) {
  $detailsElement.innerHTML = "Currently on " + number + " out of " + json.length + " (" + scraperName + ")";
  $detailsElement2.innerHTML = "Running up to " + increment + " windows at once";
}

/* INTRNAL UTILITIES */
// internal utility countdown
var _startCountdown = function() {
  countdown = estimated;
  var batches = (Math.ceil(json.length / increment));
  interval = setInterval(function() {
    $timeoutElement.innerText = "Estimated " + countdown + " seconds remaining until next starting next batch (Batch: " + batchCounter + "/" + batches + ")";
    countdown--;
  }, 1000)
}

/* INTERNAL function  */
// method to run the nightmare scraper
// depends on scraper name
var _runNightmare = function(json, index) {
  if(scraperName === 'AMI') {
    scraper.runNightmareAMI(json, index);
  } else if(scraperName === 'STATE') {
    scraper.runNightmareState(json, index);
  } else if(scraperName === 'AA') {
    scraper.runNightmareAA(json, index);
  } else if(scraperName === 'TOWER') {
    scraper.runNightmareTower(json, index);
  }
}

/* INTERNAL function  */
// final method to complete scraper and pass data back to app.js
var _completeScraper = function() {
  var output = JSON.parse(JSON.stringify(json));
  json = [];
  console.log("Complete", output)
  counter = 0;
  interval = 0;
  batchCounter = 0;
  nextBatch = increment;
  countdown = estimated;
  successCounter = 0;
  errorCounter = 0;
  pendingCounter = 0;
  clearInterval(interval);
  if(callback) {
    callback(output);
  }
}

export default {
  createNightmareInstance: createNightmareInstance,
  selectScraper: selectScraper,
  setData: setData,
  runBatch: runBatch,
  endNightmare: endNightmare
}
