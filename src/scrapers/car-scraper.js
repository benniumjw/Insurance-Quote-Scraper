import moment from 'moment';
import commonScraper from './common-scraper.js';

var AMI_URL = 'https://secure.ami.co.nz/css/car/step1#noBack';
var STATE_URL = 'https://secure.state.co.nz/car#/step1';
var AA_URL = 'https://online.aainsurance.co.nz/motor/pub/aainzquote';
var TOWER_URL = 'https://www.tower.co.nz/quote/car';

// AMI scraper
var runNightmareAMI = function (json, index) {
    var _index = index;
    var data = json[index];
    json[index].annualAmount = ''
    json[index].monthlyAmount = '';
    //json[index].quarterly = '';
    // create instance of nightmare scraper
    var nightmare = commonScraper.createNightmareInstance();
    // ami specific fields
    var $comprehensive = '#_easyui_combobox_i1_1';
    var $selectModel = '#searchByRegNoArea .searchByModel > label > a';
    var $make = '#vehicleManufacturer';
    var $address = '#garagingAddress_fullAddress';
    var $immoboliser = data.immobiliser == "TRUE" ? '#bHasImmobilizer_true' : '#bHasImmobilizer_false';
    var $business = data.business == "TRUE" ? '#bIsBusinessUse_true' : '#bIsBusinessUse_false';
    var $incidents = data.incidents == "TRUE" ? 'driverLoss' : 'driverNoLoss';
    var incDt = moment(data.incidentsDate, 'DD-MM-YYYY');
    var incDtMonth = incDt.format('MMMM');
    var incDtYear = incDt.format('YYYY')
    var output = "";
    nightmare
        .goto(AMI_URL)
        .click($comprehensive)
        .click($selectModel)
        .wait(1000)
        // select vehicle
        .evaluate(function(data) {
          $("#vehicleManufacturer").val(data.make)
          window.loadModel(data.make)
          $('#vehicleModel, input[name="vehicle.searchModel"]').val(data.model)
          window.modelChange()
          window.loadVehicleYear(data.make, data.model)
          $('#vehicleModelYear, input[name="vehicle.searchYear"]').val(data.year)
          window.yearChange()
          setTimeout(() => {
              $('#vehicleVehBodyTypeCd, input[name="vehicle.searchBodyShape"]').val(data.body.toUpperCase()).trigger('change')
              $('#vehicleVehBodyTypeCd').next().find('input').val(data.body.toUpperCase())
              window.bodyStyleChange()
          }, 3000);
          return true;
        }, data)
        .wait(4000)
        // select engine size
        .evaluate(function(data) {
            if($('.combobox-item:contains("' + data.engineSize + 'cc")').length > 0) {
              $('.combobox-item:contains("' + data.engineSize + 'cc")').click()
            } else {
              $('.combobox-item:contains("cc/")').first().click()
            }
        }, data)
        .wait(1000)
        // select final vechicle
        .evaluate(function(data) {
            if($('#searchByMMYResult a:contains("' + data.transmission.toLowerCase() + 'cc")').length > 0) {
              $('#searchByMMYResult a:contains("' + data.transmission.toLowerCase() + 'cc")').click()
            } else {
              $('#searchByMMYResult a').first().click()
            }
        }, data)
        //.containsClick('#searchByMMYResult a:contains("' + data.engineSize + '")')
        .click($immoboliser)
        .click($business)
        // select address
        .evaluate(function(data, $address) {
            $($address).val(data.addressStateAmi)
            $($address).keyup().keydown()
            $($address).keydown().keyup()
        }, data, $address)
        .wait(3000)
        // select from drop down list of addresses
        .evaluate(function(data) {
          var $elm = $('.ui-menu-item a:contains("' + data.postCode.toUpperCase() + '")');
          if($elm.length > 0) {
            $('.ui-menu-item a:contains("' + data.postCode.toUpperCase() + '")').click();
          } else {
            $('.ui-menu-item a').first().click();
          }
        }, data)
        // come back to this. The phrase needed to be chosen is 'In a locked garage', code needs to change to select first option that contains 'locked' because even unlocked options contains phrase (e.g.unlocked garage). Temp fix using a space before the word locked.
        .containsClick('.combobox-item:contains(" locked garage")')
        // add in drivers license, dob, incidents
        .evaluate(function(data, $incidents) {
            var _dob = data.dob.split('-');
            $('input[name="driverDay"]').val(_dob[0])
            $('input[name="driverMonth"]').val(_dob[1])
            $('input[name="driverYear"]').val(_dob[2])
            $('a[name="' + data.gender.toLowerCase() + '"]').click();
            $('input[name="driverLinceAge"]').val(data.ageLearners)
            $('a[name="' + $incidents + '"]').click();
            if(data.amiFreeBmax == "TRUE") {
              $('a[name="freeBMax"]').click()
            } else {
              $('a[name="notFreeBMax"]').click()
            }
            return true;
        }, data, $incidents)
        .wait(2000)
        // if yes to incidents, handle here
        .evaluate(function(data, incDtMonth, incDtYear) {
          if(data.incidents == "TRUE") {
            var opt = '';
            if(data.incidentsType === 'at fault') {
              opt = 'At Fault Accident';
            } else if(data.incidentsType == 'theft') {
              opt = 'Theft of Vehicle';
            } else if(data.incidentsType == 'not at fault') {
              opt = 'Not At Fault Accident'
            } else if(data.incidentsType == 'no vehicle') {
              opt = 'Damage Whilst Parked'
            } else {
              opt = 'Other';
            }
            $('#_easyui_combobox_i8_0').parent().find('.combobox-item:contains("' + opt + '")').click();
            $('#_easyui_combobox_i9_0').parent().find('.combobox-item:contains("' + incDtMonth + '")').click();
            $('#_easyui_combobox_i10_0').parent().find('.combobox-item:contains("' + incDtYear + '")').click();
          }
          return true;
        }, data, incDtMonth, incDtYear)
        // update parking and licence type
        .containsClick('.combobox-item:contains(" locked garage")')
        .containsClick('.combobox-item:contains("' + data.licenceType + '")')
        // move to quote page
        .click('#quoteSaveButton')
        .wait('#quoteNumberId')
        .wait(7000)
        // update sum insured
        .evaluate(function(data) {
          var min = Number($('.minimum').text().replace('$', '').replace(',', ''));
          var max = Number($('.maximum').text().replace('$', '').replace(',', ''));
          var ins = Number(data.sumInsured);
          if(ins > max) {
            ins = max;
          } else if(ins < min) {
            ins = min;
          }
          $('#agreedValueText').val(ins).change();
          return true;
        }, data)
        .wait(7000)
        // get values
        .evaluate(function(data) {
            if($('#dollars').length > 0) {
              data.annualAmount = ('$' + $('#dollars').text() + $('#cents').text()).replace(/,/g, '');
              data.monthlyAmount = $('#monthlyRiskPremium').text().trim().replace('&nbps;', '').replace(/,/g, '');
              data.sumInsured = $('#agreedValueText').val().replace(/,/g, '').replace('$', '');
              //data.quarterly = $('#quarterlyRiskPremium').text().trim().replace('&nbps;', '');
            }
            return data;
        }, data)
        .end()
        .then(function(result) {
            json[_index] = result;
            commonScraper.endNightmare(true);
        })
        .catch((error) => {
          console.log('error', error, _index + 1, json[_index])
          nightmare.end();
          commonScraper.endNightmare(false);
        })
}

// STATE scraper
var runNightmareState = function (json, index) {
    var _index = index;
    var data = json[index];
    json[index].annualAmount = ''
    json[index].monthlyAmount = '';
    //json[index].quarterly = '';
    // create instance of nightmare scraper
    var nightmare = commonScraper.createNightmareInstance();
    // state specific fields
    var mt = moment(data.dob, 'DD-MM-YYYY')
    var _dob = data.dob.split('-');
    var $gender = data.gender === 'male' ? '.male input' : '.female input';

    var $immoboliser = data.immobiliser == "TRUE" ? '#engineImmobiliserYes' : '#engineImmobiliserNo';
    var $business = data.business == "TRUE" ? '#vehicleUsageYes' : '#vehicleUsageNo';
    var $incidents = data.incidents == "TRUE" ? '#incidentsYesLabelId_driver1' : '#incidentsNoLabelId_driver1'
    var output = "";
     nightmare
        .goto(STATE_URL)
        .wait('.saveQuote')
        // set address
        .evaluate(function(data) {
          $('#situationOfRisk').val(data.addressStateAmi.toLowerCase())
          $('#situationOfRisk').trigger('keydown')
          $('#situationOfRisk').trigger('keyup')
          return true;
        }, data)
        .wait('.address a')
        // select address from list
        .evaluate(function() {
          $('.ui-autocomplete .ui-menu-item.address a:first').click();
          return true;
        })
        // select vehicle
        .click('.searchByModel label')
        .click('.searchByModel input')
        .evaluate(function(data) {
          $('#vehicleDetailMake').val(data.make)
          $('#vehicleDetailMake').keydown();
          $('#vehicleDetailMake').keyup();
          $('#vehicleDetailMake').change();
          return true;
        }, data)
        .wait(1000)
        .select('#vehicleDetailModel', data.model)
        .wait(1000)
        .select('#vehicleDetailYear', data.year)
        .wait(1000)
        // select vehicle body
        .evaluate(function(data) {
          var body = data.body.toLowerCase();
          body = body[0].replace(body[0], body[0].toUpperCase())
          var ele = $('#vehicleDetailBodyStyle option:contains("' + body + '")')
          if(ele.length == 0) {
            ele = $('#vehicleDetailBodyStyle option').last();
          }
          var val = ele.val();
          ele.parent().val(val);
          ele.parent().trigger('change');
          return true;
        }, data)
        .wait(1000)
        // select vehicle engine
        .evaluate(function(data) {
          var ele = $('#vehicleDetailEngineCapacity option:contains("' + data.engineSize + '")')
          if(ele.length == 0) {
            ele = $('#vehicleDetailEngineCapacity option').last();
          }
          var val = ele.val();
          ele.parent().val(val);
          ele.parent().trigger('change');
          return true;
        }, data)
        .wait(1000)
        // select vehicle from list
        .evaluate(function(data) {
          var clicked = false;
          var $elm;
          $('.vehicleDescription').each(function() {
            if($(this).text().toLowerCase().indexOf(data.variant.toLowerCase()) > -1) {
              $elm = $(this);
            }
          })
          if($elm) {
            $elm.parent().click();
            $elm.parent().find('input[type="radio"]').click();
          } else {
            $('.vehicleList .vehicleItem:first label, .vehicleList .vehicleItem:first input').click()
            $('.vehicleItem input[type="radio"]').first().click()
          }
          return true;
        }, data)
        .wait(500)
        // set immobilser and business
        .click($immoboliser)
        .click($business)
        // set dob, gender, multi policy discount
        .type('.dateOfBirth input.day', _dob[0])
        .select('.dateOfBirth input.month', mt.format('MMMM'))
        .type('.dateOfBirth input.year', _dob[2])
        .click($gender)
        // TODO: if we include multi policy this needs to be changed
        .click('.multiPolicyDiscount .no input')
        // select licence type
        .evaluate(function(data) {
          if(data.licenceType === "International") {
            data.licenceType = "overseas";
          }
          var ele = $('.licenceType option:contains("' + data.licenceType + '")')
          var val = ele.val();
          ele.parent().val(val);
          ele.parent().trigger('change');
          return true;
        }, data)
        // add in age
        .type('input.licenceAge', data.ageLearners)
        // select incidents
        .click($incidents)
        .click($incidents)
        .wait(500)
        // handle if incidents true
        .evaluate(function(data) {
          if(data.incidents == "TRUE") {
            var opt = '';
            if(data.incidentsType === 'at fault') {
              opt = 'Collision while driving - at fault';
            } else if(data.incidentsType == 'theft') {
              opt = 'Theft of a vehicle-at-home';
            } else if(data.incidentsType == 'not at fault') {
              opt = 'Collision while driving - not at fault';
            } else if(data.incidentsType == 'no vehicle') {
              opt = 'Parked - responsible party unknown';
            } else {
              opt = 'Collision while driving - not at fault';
            }
            var val = '';
            $('.incidentType select option').each(function() {
              var $elm = $(this);
              if($elm.text().toLowerCase().indexOf(opt.toLowerCase()) > -1) {
                val = $elm.val();
              }
            })
            if(val && data.incidentsDate) {
              var dt = data.incidentsDate.split('-');
              $('.incident-date .month').val(dt[1].replace('0', '')).trigger('change');
              $('.incident-date .year').val(dt[2]).trigger('change');
              $('.incidentType select').val(val).trigger('change');
            }
          }
        }, data)
        // save qote, update value
        .click('.saveQuote')
        .wait('.quoteNumber')
        .wait('#agreedValueText')
        .wait(1000)
        .evaluate(function(data) {
          var min = Number($('.minimum').text().replace('$', '').replace(',', ''));
          var max = Number($('.maximum').text().replace('$', '').replace(',', ''));
          var ins = Number(data.sumInsured);
          if(ins > max) {
            ins = max;
          } else if(ins < min) {
            ins = min;
          }
          $('#agreedValueText').val(ins).change();
          return true;
        }, data)
        .wait(5000)
        // get values
        .evaluate(function(data) {
            data.annualAmount = ('$' + $('.amount.annual:first .value').text() + $('.amount.annual:first .cents').text()).replace(/,/g, '');
            data.monthlyAmount = ($('.amount.monthly:first').text().replace(/,/g, ''));
            data.sumInsured = $('#agreedValueText').val().replace(/,/g, '');
            return data;
        }, data)
        .end()
        .then(function(result) {
            json[_index] = result;
            commonScraper.endNightmare(true);
        })
        .catch((error) => {
          console.log('error', error, _index + 1, json[_index])
          nightmare.end();
          commonScraper.endNightmare(false);
        })
}

// AA scraper
var runNightmareAA = function (json, index) {
    var _index = index;
    var data = json[index];
    json[index].annualAmount = ''
    json[index].monthlyAmount = '';
    //json[index].quarterly = '';
    // create instance of nightmare scraper
    var nightmare = commonScraper.createNightmareInstance();
    // state specific fields
    var trans = (data.transmission).toUpperCase()[0];

    var output = "";

    nightmare
      .goto(AA_URL)
      .wait('#productType1')
      .evaluate(function(data) {
        // select comprehensive
        $('#productType1').click()
        // todo: add in when have all the data for AA member
        $('input[name="aaMembershipDetails.aaMember"]').eq(1).click()
        // set vehicle year
        $('#vehicleYearOfManufactureList').val(data.year).change()
        return true;
      }, data)
      .wait(1000)
      // select vehicle
      .select("#vehicleMakeList", data.make.toUpperCase())
      .wait(1000)
      .select("#vehicleModelList", data.model.toUpperCase())
      .wait(1000)
      .evaluate(function(data, trans) {
        // if length is 2 then it auto selects first item
        if($('#vehicleTransmissionList option').length > 2) {
          var $elm = $('#vehicleTransmissionList option:contains("' + trans + '")');
          if($elm.length > 0) {
            $('#vehicleTransmissionList').val($elm.val()).change();
          } else {
            var val = $('#vehicleTransmissionList option:last').val();
            $('#vehicleTransmissionList').val(val).change();
          }
        }
        return true;
      }, data, trans)
      .wait(1000)
      .evaluate(function(data) {
        if($('#vehicleBodyTypeList option').length > 1) {
          var $elm = $('#vehicleBodyTypeList option:contains("' + data.body + '")');
          if($elm.length > 0) {
            $('#vehicleBodyTypeList').val($elm.val()).change();
          } else {
            var val = $('#vehicleBodyTypeList option:last').val();
            $('#vehicleBodyTypeList').val(val).change();
          }
        }
        return true;
      }, data)
      // search for vehicle
      .click('.find-your-car-btn')
      .wait('#vehicleSearchResultSize')
      .wait(1000)
      // select from list
      .evaluate(function(data) {
        var clicked = false;
        var $elm;
        $('#vehicleSearchResultSimplePanel .sg-Radio').each(function() {
          if($(this).text().toLowerCase().indexOf(data.variant.toLowerCase()) > -1) {
            $elm = $(this);
          }
        })
        if($elm) {
          $elm.click();
        } else {
          $('#vehicleSearchResultSimplePanel .sg-Radio').first().click()
        }
        return true;
      }, data)
      .wait(1000)
      // next page
      .click('#_eventId_submit')
      // set modifications to no
      .wait('#otherAccessoriesModifications2')
      .wait(1000)
      .click("#otherAccessoriesModifications2")
      // next page
      .click('#_eventId_submit')
      // set finance, primary use, and address
      .wait('input[name="vehicleFinance.financed"]')
      .wait(500)
      .evaluate(function(data) {
        if(data.finance == "TRUE") {
          $('label[for="vehicleFinance.financed1"]').click()
        } else {
          $('label[for="vehicleFinance.financed2"]').click()
        }
        // todo: currently always no business
        $('input[name="vehicleUse.vehiclePrimaryUse"]').first().click();
        $('input[name="address.suburbPostcodeRegionCity"]').val(data.suburb).keydown().change()
      }, data)
      .wait(1000)
      // finalise address
      .evaluate(function(data) {
		      var $elm = $('.ui-autocomplete .ui-menu-item a:contains("' + data.postCode.toUpperCase() + '")');
          if($elm.length > 0) {
            $('.ui-autocomplete .ui-menu-item a:contains("' + data.postCode.toUpperCase() + '")').click();
          } else {
            $('.ui-autocomplete .ui-menu-item').first().find('a').click()
          }
        $('input[name="address.streetAddress"]').val(data.streetName);
      }, data)
      // next page
      .click('#_eventId_submit')
      // get address from list
      .wait('#suggestedAddress0')
      .click('#suggestedAddress0')
      /*
      .evaluate(function(data) {
        console.log(data)
        var $elm = $('#suggestedAddresses-container .sg-Radio:contains("' + data.postCode + '")');
        if($elm.length > 0) {
          $elm.first().click();
        } else {
          $('#suggestedAddresses-container .sg-Radio').first().click();
        }
        return true;
      }, data)
      */
      .wait(500)
      .click('#_eventId_submit')
      // update other details like dob, gender, existing policies, incidents
      .wait('#previousInsurerList')
      .wait(500)
      .evaluate(function(data) {
        var dob = data.dob.split('-');
        var newdob = dob[2] + '-' + dob[1] + '-' + dob[0];
        $('input[name="mainDriver.dateOfBirth"]').val(newdob);

        if(data.gender == "MALE" ){
          $('label[for="mainDriver.driverGender1"]').click();
        } else {
          $('label[for="mainDriver.driverGender2"]').click();
        }
        if(data.otherPolicies == "TRUE") {
          $('label[for="existingPolicies1"]').click();
        } else {
          $('label[for="existingPolicies2"]').click();
        }
        // handle incidents
        if(data.incidents3Years == "TRUE") {
          var opt = '';
          if(data.incidentsType === 'at fault') {
            opt = 'At Fault';
          } else if(data.incidentsType == 'theft') {
            opt = 'Other';
          } else if(data.incidentsType == 'not at fault') {
            opt = 'Any claims';
          } else if(data.incidentsType == 'no vehicle') {
            opt = 'Other';
          } else {
            opt = 'Other';
          }
          // todo: handle more than 1 incident?
          //$('#mainDriverNumberOfAccidentsOccurrencesButtons label:contains("' + data.incidentsNumber + '")').click();
          $('#mainDriverNumberOfAccidentsOccurrencesButtons label:contains("1")').click();
          var val = $('select[name="mainDriver.accidentTheftClaimOccurrenceList[0].occurrenceType.accidentTheftClaimOccurrenceType"] option:contains("' + opt + '")').val();
          $('select[name="mainDriver.accidentTheftClaimOccurrenceList[0].occurrenceType.accidentTheftClaimOccurrenceType"]').val(val);

          var dt = data.incidentsDate.split('-');
          $('select[name="mainDriver.accidentTheftClaimOccurrenceList[0].monthOfOccurrence.month"]').val(dt[1].replace('0', ''))
          $('select[name="mainDriver.accidentTheftClaimOccurrenceList[0].yearOfOccurrence.year"]').val(dt[2])
        } else {
          $('#mainDriverNumberOfAccidentsOccurrencesButtons label:contains("0")').click();
        }
        // TODO: additional drivers details, currently sets to no
        $('label[for="numberOfAdditionalDrivers1"]').click();
      }, data)
      // sets previous insurer
      .select('#previousInsurerList', "NONE")
      // next page
      .click('#_eventId_submit')
      .wait('#yearlyPremiumId')
      // get sum insured
      .evaluate(function(data) {
        var min = Number($('#amountCoveredInput').attr('data-amount-covered-min'))
        var max = Number($('#amountCoveredInput').attr('data-amount-covered-max'))
        var ins = Number(data.sumInsured);
        if(ins > max) {
          ins = max;
        } else if(ins < min) {
          ins = min;
        }
        $('#amountCoveredInput').val(ins).keyup().keydown()
        return true;
      }, data)
      .wait(3000)
      // get yearly
      .evaluate(function(data) {
        window.localStorage.setItem('yearly', $('#yearlyPremiumId').text().replace(/,/g, ''))
        return true;
      }, data)
      // click monthly tab
      .click('#payMonthlySelected')
      .wait(1000)
      // get monthly and done
      .evaluate(function(data) {
        data.annualAmount = window.localStorage.getItem('yearly');
        data.monthlyAmount = $('#monthlyPremiumId').text().replace(/,/g, '');
        data.sumInsured = $('#amountCoveredInput').val().replace(/,/g, '');;
        return data;
      }, data)
      .end()
      .then(function(result) {
          json[_index] = result;
          commonScraper.endNightmare(true);
      })
      .catch((error) => {
        console.log('error', error, _index + 1, json[_index])
        nightmare.end();
        commonScraper.endNightmare(false);
      })
}


// TOWER_URL scraper
var runNightmareTower = function (json, index) {
    var _index = index;
    var data = json[index];
    json[index].annualAmount = ''
    json[index].monthlyAmount = '';
    //json[index].quarterly = '';
    // create instance of nightmare scraper
    var nightmare = commonScraper.createNightmareInstance();
    // state specific fields
    var trans = (data.transmission).toUpperCase()[0];

    var output = "";

    function coreFunction() {
      nightmare
        .wait('.vehicle-registration-lookup')
        .wait(1000)
        // update make, model, year, body variant
        .evaluate(function(data) {
          $('.vehicle-registration-lookup .form-link').click()
          $('.dropdown-list[name="Make"] .dropdown-menu li:contains("'+data.make+'") a').first().click()
          return true;
        }, data)
        .wait(250)
        .evaluate(function(data) {
			if(data.model && data.model.toLowerCase() === 'rover') {
			$('.dropdown-list[name="Model"] .dropdown-menu li:contains("'+data.model+'") a').last().click()
			} else {
			$('.dropdown-list[name="Model"] .dropdown-menu li:contains("'+data.model+'") a').first().click()
			}
		 return true;
		}, data)
        .wait(250)
        .evaluate(function(data) {
          $('.dropdown-list[name="YearOfManufacture"] .dropdown-menu li:contains("' + data.year + '") a').first().click()
          return true;
        }, data)
        .wait(250)
        .evaluate(function(data) {
          var ele = $('.dropdown-list[name="BodyShape"] .dropdown-menu li:contains("' + data.body + '") a');
          if(ele.length > 0) {
            ele.first().click();
          } else {
            $('.dropdown-list[name="BodyShape"] .dropdown-menu li a').first().click();
          }
          return true;
        }, data)
        .wait(250)
        .evaluate(function(data) {
          var ele = $('.dropdown-list[name="Variant"] .dropdown-menu li:contains("' + data.variant + '") a')
          if(ele.length > 0) {
            ele.first().click();
          } else {
            $('.dropdown-list[name="Variant"] .dropdown-menu li a').first().click();
          }
          return true;
        }, data)
        .wait(1000)
        // update everything else
        .evaluate(function(data) {
          $('div[name="CarLocation"] .search-dropdown > input').val(data.street).keydown().keyup().change()
          if(data.business == "TRUE") {
            $('div[name="UsedForBusiness"] .radio-item-content').eq(0).click()
          } else {
            $('div[name="UsedForBusiness"] .radio-item-content').eq(1).click()
          }
          if(data.parking == "locked") {
            $('div[name="Garaged"] .radio-item-content').eq(0).click()
          } else {
            $('div[name="Garaged"] .radio-item-content').eq(1).click()
          }
          if(data.immobiliser == "TRUE") {
            $('div[name="FactoryFittedAlarm"] .radio-item-content').eq(0).click()
          } else {
            $('div[name="FactoryFittedAlarm"] .radio-item-content').eq(1).click()
          }
          if(data.modifications == "TRUE") {
            $('div[name="AccessoriesModifications"] .radio-item-content').eq(0).click()
          } else {
            $('div[name="AccessoriesModifications"] .radio-item-content').eq(1).click()
          }
          // turned to false
          /*
                                  $('div[name="ExcludeUnder25"] .radio-item-content').eq(1).click()
          */
          if(data.excludeUnder25 == "TRUE") {
            $('div[name="ExcludeUnder25"] .radio-item-content').eq(0).click()
          } else {
            $('div[name="ExcludeUnder25"] .radio-item-content').eq(1).click()
          }
          if(data.gender == "MALE") {
            $('div[name="MainDriverGender"] .radio-item-content').eq(0).click()
          } else {
            $('div[name="MainDriverGender"] .radio-item-content').eq(1).click()
          }
          var _dob = data.dob.split('-');
          var newdob = _dob[0] + '/' + _dob[1] + '/' + _dob[2];

          $('input[name="MainDriverDateOfBirth"]').val(newdob).change()
          $('div[name="MainDriverYearsHeldLicence"] .dropdown-menu a:contains("' + data.licenceYears + '")').click()

          if(data.incidents == "TRUE") {
            $('div[name="TheftAccidentClaimExcess"] .radio-item-content').eq(0).click()
            $('div[name="TheftAccidentClaimExcessCount"] a:contains("' + data.incidentsNumber + '")').click()
          } else {
            $('div[name="TheftAccidentClaimExcess"] .radio-item-content').eq(1).click()
          }

          // TODO: need gender, dob, years driving if true
          $('div[name="AnyoneElseDriveCar"] .radio-item-content').eq(1).click()
          /*
          if(data.additionalDrivers == "TRUE") {
            $('div[name="AnyoneElseDriveCar"] .radio-item-content').eq(0).click()
          } else {
            $('div[name="AnyoneElseDriveCar"] .radio-item-content').eq(1).click()
          }
          */

          // todo: need number of policies, 1 or 2 or more
          /*
          if(data.otherPolicies == "TRUE") {
            $('div[name="OtherPolicies"] .radio-item-content').eq(0).click()
          } else {
            $('div[name="OtherPolicies"] .radio-item-content').eq(1).click()
          }
          */
          $('div[name="OtherPolicies"] .radio-item-content').eq(1).click()
          return true;
        }, data)
        .wait(3000)
        // set the car location from list based on post code
        .evaluate(function(data) {
          $('div[name="CarLocation"] .search-dropdown a:contains("' + data.postCode + '")').first().click();
          return true;
        }, data)
        .wait(500)
        // go to next page
        .evaluate(function() {
          $('button:contains("Next")').click()
        })
        /*
		    .wait('#totalPremiumAnnual')
		    */
        .wait(1000)
        // update insured value
        .evaluate(function(data) {
          $('div[name="MajorLobId"] > div > a ').eq(1).click()
          var min = Number($('.insured-values').find('label:contains("Minimum")').next().text().replace('$', '').replace(',', ''));
          var max = Number($('.insured-values').find('label:contains("Maximum")').next().text().replace('$', '').replace(',', ''));
          var ins = Number(data.sumInsured);
          if(ins > max) {
            ins = max;
          } else if(ins < min) {
            ins = min;
          }
          $('#InsuredValue').val(ins);
		      $('#InsuredValue').change()
          $('#recalculatePremium').click();
        }, data)
		    .wait(4000)
		    .wait('#totalPremiumAnnual')
		    // get data
        .evaluate(function(data) {
          data.annualAmount = $('#totalPremiumAnnual').text().replace(/,/g, '')
          data.monthlyAmount = $('#totalPremiumMonthly').text().replace(/,/g, '')
          data.sumInsured = $('#InsuredValue').val().replace(/,/g, '');;
          return data;
        }, data)
        .end()
        .then(function(result) {
            json[_index] = result;
            commonScraper.endNightmare(true);
        })
        .catch((error) => {
          console.log('error', error, _index + 1, json[_index])
          nightmare.end();
          commonScraper.endNightmare(false);
        })
    }

    nightmare
      .goto(TOWER_URL)
      .then(() => {
        coreFunction()
      })
      .catch(error => {
        return coreFunction();
      })
}

// public methods
export default {
  runNightmareAMI: runNightmareAMI,
  runNightmareState: runNightmareState,
  runNightmareAA: runNightmareAA,
  runNightmareTower: runNightmareTower
}
