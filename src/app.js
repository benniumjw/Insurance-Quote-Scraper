// Here is the starting point for your application code.
const {dialog} = require('electron').remote
var fs = require('fs');
var fastcsv = require("fast-csv");

// Small helpers you might want to keep
import './helpers/context_menu.js';
import './helpers/external_links.js';
import csv from './csv.js';
import moment from 'moment';

// interpreters handle csv import to json object
import homeInterpreter from './interpreters/home-interpreter.js';
import carInterpreter from './interpreters/car-interpreter.js';
// need a few functions from this
import commonScraper from './scrapers/common-scraper.js';

// default, changed by drop down list
var jsonInterpreter = homeInterpreter;

// set csv interpreter based on drop down list
var setInterpreter = function(type) {
  if(type == 'car') {
    jsonInterpreter = carInterpreter;
  } else {
    jsonInterpreter = homeInterpreter;
  }
}

// disable buttons when running
var disableButtons = function() {
  var buttons = document.querySelectorAll('.btn');
  buttons.forEach(function(btn) {
    btn.disabled = true;
  })
}

// enable buttons when complete or not running
var enableButtons = function() {
  var buttons = document.querySelectorAll('.btn');
  buttons.forEach(function(btn) {
    btn.disabled = false;
  })
}

// convert CSV file into JSON object
var getJsonFromCsv = function(filename, callback) {
  var input = [];
  fastcsv.fromPath(filename, { headers: true })
  .on("data", function(data){
      input.push(data);
  })
  .on("end", function(){
      callback(input);
  });
}

// run actual scraper and adjust UI as needed
var runScraper = function(scraperName) {
  var increment = Number(document.querySelector('#parallelWindows').value);
  var showWindows = document.querySelector('#showWindows').value == "true";
  disableButtons();
  // get csv file
  dialog.showOpenDialog({
    title: 'Select CSV',
    filters: [ { 'name': 'csv', 'extension' : ['csv'] }],
    properties: ['openFile'],
  }, function(filenames) {
    if(filenames && filenames.length > 0) {
      getJsonFromCsv(filenames[0], (input) => {
        console.log("Started at: " + moment().format('DD/MM/YYYY HH:mm:SS'))
        document.querySelector('#started').innerHTML = "Started at: " + moment().format('DD/MM/YYYY HH:mm:SS');
        document.querySelector('#ended').innerHTML = "";
        document.querySelector('#counterContainer').style.display = 'block';
        document.querySelector('#successCount').innerHTML = '0';
        document.querySelector('#errorCount').innerHTML = '0';
        document.querySelector('#pendingCount').innerHTML = '0';
        var _input = jsonInterpreter(input, scraperName);
        // give data to scraper
        commonScraper.setData(_input, scraperName, increment, showWindows);
        // run batch
        commonScraper.runBatch((result) => {
          console.log("RUN BATCH DONE", result)
          // finished
          endOfScraper(result, scraperName);
          console.log("Ended at: " + moment().format('DD/MM/YYYY HH:mm:SS'))
          document.querySelector('#ended').innerHTML = "Ended at: " + moment().format('DD/MM/YYYY HH:mm:SS');
        });
      });
    } else {
      enableButtons();
    }
  });
}

// run all the scrapers, one after the other
var runAllScrapers = function() {
  var increment = Number(document.querySelector('#parallelWindows').value);
  var showWindows = document.querySelector('#showWindows').value == "true";
  disableButtons();
  // get csv file
  dialog.showOpenDialog({
    title: 'Select CSV',
    filters: [ { 'name': 'csv', 'extension' : ['csv'] }],
    properties: ['openFile'],
  }, function(filenames) {
    if(filenames && filenames.length > 0) {
      console.log("Started at: " + moment().format('DD/MM/YYYY HH:mm:SS'))
      document.querySelector('#started').innerHTML = "Started at: " + moment().format('DD/MM/YYYY HH:mm:SS');
      document.querySelector('#ended').innerHTML = "";
      document.querySelector('#counterContainer').style.display = 'block';
      document.querySelector('#successCount').innerHTML = '0';
      document.querySelector('#errorCount').innerHTML = '0';
      document.querySelector('#pendingCount').innerHTML = '0';
      getJsonFromCsv(filenames[0], (input) => {
        var _input = jsonInterpreter(input, 'AA');
        // give data to scraper
        commonScraper.setData(_input, 'AA', increment, showWindows);
        // run batch
        commonScraper.runBatch((result) => {
          // finished
          endOfScraper(result, 'AA');
          // next
          _input = jsonInterpreter(input, 'AMI');
          commonScraper.setData(_input, 'AMI', increment, showWindows);
          commonScraper.runBatch((result) => {
            // finished
            endOfScraper(result, 'AMI');
            // next
            _input = jsonInterpreter(input, 'STATE');
            commonScraper.setData(_input, 'STATE', increment, showWindows);
            commonScraper.runBatch((result) => {
              // finished
              endOfScraper(result, 'STATE');
              // next
              _input = jsonInterpreter(input, 'TOWER');
              commonScraper.setData(_input, 'TOWER', increment, showWindows);
              commonScraper.runBatch((result) => {
                endOfScraper(result, 'TOWER');
                enableButtons();
                document.querySelector('#ended').innerHTML = "Ended at: " + moment().format('DD/MM/YYYY HH:mm:SS');
              })
            })
          })
        });
      })
    } else {
      enableButtons();
    }
  });
}

// update UI and export csv at end of scrapers
var endOfScraper = function(result, scraperName) {
  document.querySelector('#details').innerHTML = "All Done";
  document.querySelector('#details2').innerHTML = "";
  document.querySelector('#countdown').innerHTML = "";
  enableButtons();
  console.log(Object.keys(result[0]), result);
  csv.exportCSVFile(Object.keys(result[0]), result, "IQS-" + scraperName + "-EXPORT-" + new Date().getTime());
}

// run AA scraper
document.querySelector('#btnAa').addEventListener('click', () => {
  runScraper("AA");
});

// run AMI scraper
document.querySelector('#btnAmi').addEventListener('click', () => {
  runScraper("AMI");
});

// run STATE scraper
document.querySelector('#btnState').addEventListener('click', () => {
  runScraper("STATE");
});

// run TOWER scraper
document.querySelector('#btnTower').addEventListener('click', () => {
  runScraper("TOWER");
});

// run ALL scraper
document.querySelector('#btnAll').addEventListener('click', () => {
  runAllScrapers()
});

// set the scraper
document.querySelector("#scraperChoice").addEventListener('change', () => {
  var type = document.querySelector("#scraperChoice").value;
  setInterpreter(type);
  commonScraper.selectScraper(type);
})
