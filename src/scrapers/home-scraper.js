import moment from 'moment';
import commonScraper from './common-scraper.js';

var AMI_URL = 'https://secure.ami.co.nz/Premier/House';
var STATE_URL = 'https://secure.state.co.nz/home/Comprehensive';
var AA_URL = 'https://online.aainsurance.co.nz/home/pub/aainzquote?productType=classic&occupancyDetails=owner&coverType=home';
var TOWER_URL = 'https://www.tower.co.nz/quote/house-and-contents';

// AMI scraper
var runNightmareAMI = function (json, index) {
    var _index = index;
    var data = json[index];
    json[index].annualAmount = ''
    json[index].monthlyAmount = '';
    var nightmare = commonScraper.createNightmareInstance();

    var $gender = data.gender === 'male' ? '#ownerGender-male_0' : '#ownerGender-female_0';
    var $hasGarage = data.hasGarage === 'Yes' ? '#hasGarage-yes' : '#hasGarage-no';
    var $glassExcess = data.glassExcess === 'Yes' ? '#glassBuyout-yes' : '#glassBuyout-no';
    var output = "";
    nightmare
        .goto(AMI_URL)
        .wait(1000)
        .click('#hazardZone-no')// must be no
        .click('#numberOfInsuredUnits-1') // must be no
        .click('#propertyUnderRenovation-no') // must be no
        .click('#homeFloorArea-no') // must be no
        .wait(500)
        .click('.intro .navigation .button')
        .evaluate(function(data) {
          $("input[name='effectiveDate']").val(moment().format('DD/MM/YYYY')).change();
          $('#addressFinder').val(data.addressStateAmi.toLowerCase()).change().keyup().keydown()
          return true;
        }, data)
        .wait('li.address')
        .evaluate(function(data) {
          $('li.address').first().click();
          return true;
        }, data)
        .click('#usage-yes') // residential only must be yes
        .evaluate(function(data) {
          // Owner Occupied, Holiday Home, Owner + Boarder, Owner + Tenants, Let to Tenants,
          // Unoccupied for greater than 60 days, Employee/Relative, Boarding House
          var ele = $('select[name="occupationType"] option:contains("' + data.occupancy + '")')
          if(ele.length == 0) {
            ele = $('select[name="occupationType"] option').last();
          }
          var val = ele.val();
          ele.parent().val(val);
          ele.parent().trigger('change');

          if(data.occupancy.toUpperCase().indexOf('HOLIDAY') > -1) {
            $('#shortTermTenancy-no').click()
            $('#shortTermTenancy-no').prop('checked', true).trigger('change')
            $('#shortTermTenancy-no').click()
          }

          if(data.occupancy.toUpperCase().indexOf('Tenants') > -1) {
            $('#multiTenancy-no').click()
            $('#multiTenancy-no').prop('checked', true).trigger('change')
            $('#multiTenancy-no').click()
          }
          // dob for owner occupied
          var _dob = data.dob.split('-');
          $('#ownerDOB-day').val(_dob[0]).trigger('change')
          $('#ownerDOB-month').val(Number(_dob[1])).trigger('change')
          $('#ownerDOB-year').val(_dob[2]).trigger('change')
          return true;
        }, data)
        .click($gender)
        .click('#shortTermTenancy-no, #multiTenancy-no') // must be no
        .evaluate(function(data) {
          if(data.carInsurance) {
            $('#carInsurance').click()
            $('#carInsurance').prop('checked', true).trigger('change')
          }
          if(data.contentsInsurance) {
            $('#homeContentInsurance').click()
            $('#homeContentInsurance').prop('checked', true).trigger('change')
          }
          if(data.farmInsurance) {
            $('#farmInsurance').click()
            $('#farmInsurance').prop('checked', true).trigger('change')
          }
          if(data.boatInsurance) {
            $('#boatInsurance').click()
            $('#boatInsurance').prop('checked', true).trigger('change')
          }
          return true;
        }, data)
        .click("#page1ContinueButton")
        .evaluate(function(data) {
          // Freestanding House, Retirement Unit, Semi-detached House/Terrace
          // Flat or Unit, Apartment, Boarding House
          var buildingType = data.buildingType;
          // if(buildingType == 'house' > -1) {
          //   buildingType = 'House/Terrace'
          // }
          var ele = $('select[name="buildingType"] option:contains("' + buildingType + '")')
          if(ele.length == 0) {
            ele = $('select[name="buildingType"] option:contains("House")').first();
          }
          var val = ele.val();
          ele.parent().val(val);
          ele.parent().trigger('change');
          return true;
        }, data)
        .evaluate(function(data) {
          // Brick Veneer, Concrete Block Veneer, Double Brick, Fibre Cement, Mud Brick
          // Metal, Natural Stone, Rockcote EPS, Solid Concrete Walls, Stucco, Timber / Weatherboard
          var ele = $('select[name="constructionType"] option:contains("' + data.constructionType + '")')
          if(ele.length == 0) {
            ele = $('select[name="constructionType"] option').last();
          }
          var val = ele.val();
          ele.parent().val(val);
          ele.parent().trigger('change');
          return true;
        }, data)
        .evaluate(function(data) {
          // Fibro, Tin/Colourbond, Concrete, Terracotta/Clay Tiles, Slate, Shingles, CementTiles
          var ele = $('select[name="roofType"] option:contains("' + data.roofType + '")')
          if(ele.length == 0) {
            ele = $('select[name="roofType"] option').last();
          }
          var val = ele.val();
          ele.parent().val(val);
          ele.parent().trigger('change');
          return true;
        }, data)
        .click('#' + data.houseStandard) // Ordinary, Quality, Prestige (note uppercase)
        .click('#' + data.landShape) // FlatAndGentle, Moderate, Severe
        .evaluate(function(data) {
          $('#yearBuilt').val(data.yearBuilt).trigger('change');
          return true;
        }, data)
        // todo: are we doing houses pre 1935
        .click('#orginalWiringReplaced-yes')
        .click('#orginalPipingReplaced-yes')
        .click('#orginalPilesReplaced-yes')
        .click('#modernWallLinings-yes')
        .click('#orginalRoofReplaced-yes')
        .click('#historicProperty-no')
        .click('#heritageProperty-no')
        .evaluate(function(data) {
          $('#yearPurchase').val(data.purchaseYear).trigger('change');
          return true;
        }, data)
        .click('#mortgageeSale-no') // if above is 2017 this appears, must be no
        .evaluate(function(data) {
          var ele = $('select[name="numberOfStoreys"] option:contains("' + data.numberOfStories + '")')
          if(ele.length == 0) {
            ele = $('select[name="numberOfStoreys"] option').last();
          }
          var val = ele.val();
          ele.parent().val(val);
          ele.parent().trigger('change');
          return true;
        }, data)
        .evaluate(function(data) {
          $('#dwellingFloorArea').val(data.dwellingFloorArea).trigger('change');
          return true;
        }, data)
        .click($hasGarage)
        .evaluate(function(data) {
          $('#garageFloorArea').val(data.garageFloorArea).trigger('change');
          return true;
        }, data)
        .click("#specialFeatures-no") // must be no
        .evaluate(function(data) {
          $('#bldgSumInsured').val(data.sumInsured).trigger('change');
          return true;
        }, data)
        .click($glassExcess)
        .click('#send-quote-id')
        // move to quote page
        .wait('#qs-excess .qs-excess-amount')
        // get values
        .evaluate(function(data) {
            if($('#qs-dollars').length > 0) {
              data.annualAmount = $('#qs-premium').text().trim().replace('per year', '').replace(/,/g, '')
              data.monthlyAmount = $('#qs-premium').next().next().next().find('span').text().trim().replace('per year', '').replace(/,/g, '')
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
    // create instance of nightmare scraper
    var nightmare = commonScraper.createNightmareInstance();
    // state specific fields
    var mt = moment(data.dob, 'DD-MM-YYYY')
    var _dob = data.dob.split('-');
    var $gender = data.gender === 'male' ? '#ownerGender-male_0' : '#ownerGender-female_0';
    var $previousClaim = data.previousClaim === 'Yes' ? '#previousClaim-yes' : '#previousClaim-no';
    var $codeCompliance = data.codeCompliance === 'Yes' ? '#codeComplianceYesLabel' : '#codeComplianceNoLabel';
    var $hasGarage = data.hasGarage === 'Yes' ? '#freeStandingYesLabel' : '#freeStandingNoLabel';
    //var $glassExcess = data.glassExcess === 'Yes' ? '#glassBuyout-yes' : '#glassBuyout-no';
    var output = "";
     nightmare
        .goto(STATE_URL)
        .wait('#page1ContinueButton')
        .evaluate(function(data) {
          $('#coverStartDate').val(moment().format('DD/MM/YYYY')).change();
          return true;
        }, data)
        // set address
        .evaluate(function(data) {
          $('#addressFinder').val(data.addressStateAmi.toLowerCase())
          $('#addressFinder').trigger('keydown')
          $('#addressFinder').trigger('keyup')
          return true;
        }, data)
        .wait('li.address a')
        // select address from list
        .evaluate(function() {
          $('.ui-autocomplete .ui-menu-item.address a:first').click();
          return true;
        })
        // residential only
        .evaluate(function(data) {
          var ele = $('select[name="usage"] option:contains("' + "Residential/Private use only" + '")')
          if(ele.length == 0) {
            ele = $('select[name="usage"] option').last();
          }
          var val = ele.val();
          ele.parent().val(val);
          ele.parent().trigger('change');
          return true;
        }, data)
        // occupationType and dob
        .evaluate(function(data) {
          // Owner Occupied, Owners holiday home / Weekender, Combination of owner(s) and boarder(s),
          // Combination of owner(s) and tenant(s), Tenants, Tenants for holiday letting (fails), Unoccupied
          // var occupancy = data.occupancy;
          // if(occupancy.toUpperCase() === 'HOLIDAY' || occupancy.toUpperCase() === 'BOARD') {
          //   occupancy = occupancy.toLowerCase();
          // }
          var ele = $('select[name="occupationType"] option:contains("' + data.occupancy + '")')
          if(ele.length == 0) {
            ele = $('select[name="occupationType"] option').last();
          }
          var val = ele.val();
          ele.parent().val(val);
          ele.parent().trigger('change');
          // dob
          var _dob = data.dob.split('-');
          $('#ownerDOB-day').val(_dob[0]).trigger('change')
          $('#ownerDOB-month').val(Number(_dob[1])).trigger('change')
          $('#ownerDOB-year').val(_dob[2]).trigger('change')
          return true;
        }, data)
        // gender and claim
        .click($gender)
        .click($previousClaim)
        // previouis claim yes fields
        .evaluate(function(data) {
          // must be me
          var ele = $('#incidentPolicyHolder_0 option').eq(1);
          var val = ele.val();
          ele.parent().val(val);
          ele.parent().trigger('change');
          return true;
        }, data)
        // incidents
        .evaluate(function(data) {
          // Accidental Damage, Intentional Act - Not By Tenant, Damage By Natural Disaster, Damage By Sudden Escape Or Water,
          // Damage Caused By Animals/Pets, Damage Caused By Fire, Damage Caused By Flood, Damage Caused By Impact,
          // Intentional Act - By Tenant, Damage Caused By Storm, Damage To Keys And Locks, Damage Caused by Explosion
          // Fusion, Glass Breakage,  Gradual Damage, Hail Damage, Injury Liability, Leakage Of Oil, Tenant Vacating Without Notice,
          // Legal Liability,Damage Caused By Lightning, Lost Item(s), Public Disturbance, Rent Default, Spectacles, Dentures And Hearing Aids,
          // Theft - At Home - Forced Entry, Theft - At Home - Unforced Entry, Theft – Away From Home, Theft By Tenant
          var ele = $("#incidentDescription_0 option").eq(1);
          var val = ele.val();
          ele.parent().val(val);
          ele.parent().trigger('change');

          // incident date
          var incidentsDate = data.incidentsDate.split('-');
          $('#incidentDateMonth_0').val(Number(incidentsDate[1])).change();
          $('#incidentDateYear_0').val(incidentsDate[2]).change();
          return true;
        }, data)
        .evaluate(function(data) {
          if(data.homeCombInsurance) {
            $('#homeCombInsurance').click()
            $('#homeCombInsurance').prop('checked', true).trigger('change')
          }
          if(data.contentsInsurance) {
            $('#homeContentInsurance').click()
            $('#homeContentInsurance').prop('checked', true).trigger('change')
          }
          return true;
        }, data)
        .click('#page1ContinueButton')
        .evaluate(function(data) {
          // Brick Veneer, Concrete block (Besser), Cement, Cladding, Double brick,
          // Fibre cement (Fibro), Mud brick, Metal, Rockcote EPS (Expanded polystyrene),
          // Rock / Stone, Timber or weatherboard
          var ele = $('select[name="constructionType"] option:contains("' + data.constructionType + '")')
          if(ele.length == 0) {
            ele = $('select[name="constructionType"] option').last();
          }
          var val = ele.val();
          ele.parent().val(val);
          ele.parent().trigger('change');
          return true;
        }, data)

        .evaluate(function(data) {
          // Fibro, Tin/Colourbond, Concrete, Terracotta/Clay Tiles, Slate, Shingles, Cement Tiles
          var ele = $('select[name="roofType"] option:contains("' + data.roofType + '")')
          if(ele.length == 0) {
            ele = $('select[name="roofType"] option').last();
          }
          var val = ele.val();
          ele.parent().val(val);
          ele.parent().trigger('change');
          return true;
        }, data)

        .click("#hazardZoneLabelNo")
        .click('#numberOfInsuredUnitsLabelNo')
        // year built and dwelling floor area
        .evaluate(function(data) {
          $('#yearBuilt').val(data.yearBuilt).trigger('change');
          $('#dwellingFloorArea').val(data.dwellingFloorArea).trigger('change');
          return true;
        }, data)
        // code compliance
        .click($codeCompliance)

        .evaluate(function(data) {
          $('#bldgSumInsured').val(data.sumInsured).trigger('change');
          return true;
        }, data)
        // garage
        .click($hasGarage)
        .evaluate(function(data) {
          $('#garageFloorArea').val(data.garageFloorArea).trigger('change');
          return true;
        }, data)
        .click("#specialFeatures-no") // must be no
        .evaluate(function(data) {
          $('#bldgSumInsured').val(data.sumInsured).trigger('change');
          return true;
        }, data)

        .click('#homeDetailsContinue')
        .wait('.price.active')
        // get values
        .evaluate(function(data) {
            data.annualAmount = $('#paymentFrequencyAnnuallyPrice').text().replace(/,/g, '');
            data.monthlyAmount = $('#paymentFrequencyMonthlyPrice').text().replace(/,/g, '');
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

    var output = "";

    nightmare
      .goto(AA_URL)
      .wait('#policyStartDate')
      .evaluate(function(data) {
        // aa member - do we need yes? need aa number and stuff then
        $('label[for="aaMembershipDetail2"]').click().trigger('change'); // no

        // occupancy
        var occupancy = data.occupancy;
        if(occupancy.toUpperCase().indexOf('OWNER') > -1 || occupancy.toUpperCase().indexOf('HOLIDAY') > -1) {
          $('label[for="occupancyDetail1"]').click().trigger('change'); // owner or holiday (i own and live in the house)
        } else if(occupancy.toUpperCase().indexOf('LANDLORD') > -1) {
          $('label[for="occupancyDetail2"]').click().trigger('change'); // landlord - [NO QUOTE]
        } else {
          $('label[for="occupancyDetail3"]').click().trigger('change'); // renting - [NO QUOTE]
        }

        // if owner occupied
        if(occupancy.toUpperCase().indexOf('OWNER') > -1) {
          $('label[for="residencyType1"]').click().trigger('change'); // permenant
        } else {
          $('label[for="residencyType2"]').click().trigger('change'); // weekend/holiday house
        }

        // house insurance only
        $('label[for="coverType1"]').click().trigger('change');

        // address postcode
        $('input[name="address.suburbPostcodeRegionCity"]').val(data.postCode.toUpperCase()).keyup().keydown().change()
        return true;
      }, data)
      .wait(1000)
      .evaluate(function(data) {
        // click first?
        // finalise address
        var $elm = $('.ui-autocomplete .ui-menu-item a:contains("' + data.postCode.toUpperCase() + '")');
        if($elm.length > 0) {
          $('.ui-autocomplete .ui-menu-item a:contains("' + data.postCode.toUpperCase() + '")').click();
        } else {
          $('.ui-autocomplete .ui-menu-item').first().find('a').click()
        }
        // address street
        $('input[name="address.streetAddress"]').val(data.streetName).keyup().keydown().change()
        // dob
        var dob = data.dob.split('-');
        var newdob = dob[2] + '-' + dob[1] + '-' + dob[0];
        $('#dateOfBirth').val(newdob).trigger('change')

        // existing policies
        if(data.haveAAPolicies) {
          $('label[for="existingSuncorpPolicies1"]').click().trigger('change'); // yes
        } else {
          $('label[for="existingSuncorpPolicies2"]').click().trigger('change'); // no
        }

        // previous insurere
        $('#previousInsurer').val('NONE').trigger('change')
        return true;
      }, data)
      .click('#_eventId_submit')
      .wait('#suggestedAddress0')
      .evaluate(function(data) {
        $('#suggestedAddress0').parent().click().trigger('change')
        return true;
      }, data)
      .click('#_eventId_submit')
      .wait("#buildingType-help")
      .evaluate(function(data) {
        // house type
        if(data.buildingType.indexOf('Freestanding') > -1) {
          $('label[for="buildingType1"]').click().trigger('change') // freestanding house
        } else if(data.buildingType.indexOf('Multi-unit (part of 4 or less)') > -1) {
          $('label[for="buildingType3"]').click().trigger('change') // multi unit part of 4 or less
        } else if(data.buildingType.indexOf('Apartment') > -1) {
          $('label[for="buildingType3"]').click().trigger('change') // apartment causes "call us"
        } else if(data.buildingType.indexOf('Multi-unit (part of 5 or more)') > -1) {
          $('label[for="buildingType4"]').click().trigger('change') // multi unit part of 5 or more causes call us
        }
        // body corp - must be no
        $('label[for="strataTitle2"]').click().trigger('change')

        // construction material
        // "Aluminium, Brick veneer, Concrete, Double Brick, Fibro/Asbestos, Hardiplank/Hardiflex,Vinyl Cladding, Weatherboard/Wood"
        var constructionType = data.constructionType;
        // change to single word
        // if(constructionType === 'Concrete Block') {
        //   constructionType == 'Concrete'
        // }
        if ($('#externalWallMaterialButtons span:contains("' + constructionType + '")').length > 0) {
          $('#externalWallMaterialButtons span:contains("' + constructionType + '")').parents('label').click()
        } else {
          $('#externalWallMaterialButtons span:contains("' + "Wood" + '")').parents('label').click() // default wood
        }

        // roof material
        // "Aluminium, Concrete, Fibro/Asbestos Cement, Iron (Corrugated), Slate, Steel/Colorbond, Tiles, Timber"
        var roofType = data.roofType;
        if ($('#roofMaterialButtons span:contains("' + roofType + '")').length > 0) {
          $('#roofMaterialButtons span:contains("' + roofType + '")').parents('label').click()
        } else {
          $('#roofMaterialButtons span:contains("' + "Timber" + '")').parents('label').click() // default timber
        }
        // year
        $('#constructionYear').val(data.yearBuilt).keydown().keyup().change()
        return true;
      }, data)
      .click('#_eventId_submit')
      .wait('#balconyDeckVerandah')
      .evaluate(function(data) {
        // stories
        if(data.numberOfStories == 1) {
          $('label[for="SINGLE_STOREY"]').click().trigger('change')
        } else if(data.numberOfStories == 2) {
          $('label[for="DOUBLE_STOREY"]').click().trigger('change')
        }
        // $('label[for="DOUBLE_STOREY"]').click().trigger('change')
        // $('label[for="THREE_STOREYS"]').click().trigger('change')
        // $('label[for="FOUR_STOREYS"]').click().trigger('change')
        // $('label[for="FIVE_STOREYS"]').click().trigger('change')
        // $('label[for="SIX_STOREYS"]').click().trigger('change') // causes "call us"

        // self proclaimed dwellings - must be no otherwise causes call us
        $('label[for="noOfDwellingUnits2"]').click().trigger('change')

        // car spaces - 0 to 4+ (carSpace0 = 1)
        var carSpaces = data.carSpaces ? Number(data.carSpaces) + 1 : 1;
        $('#carSpace' + carSpaces).parent().click().trigger('change')

        // features - could ignore these?
        if(data.balcony == 'TRUE') {
          $('#balconyDeckVerandah').parent().click().trigger('change')
        }
        if(data.swimmingPool == 'TRUE') {
          $('#swimmingPool').parent().click().trigger('change')
        }
        if(data.sportCourt == 'TRUE') {
          $('#tennisCourt').parent().click().trigger('change')
        }
        if(data.gardenShed == 'TRUE') {
          $('#gardenShed').parent().click().trigger('change')
        }
        if(data.shed == 'TRUE') {
          $('#shed').parent().click().trigger('change')
        }
        if(data.waterTanks == 'TRUE') {
          $('#waterTanks').parent().click().trigger('change')
        }
        return true;
      }, data)
      // house size
      .type('#buildingArea', data.dwellingFloorArea)
      .evaluate(function(data) {
        $('#buildingArea').keydown()
        return true;
      }, data)
      .click('#estimateReplacementCost')
      .evaluate(function(data) {
        $('#buildingSum').val(data.sumInsured).keyup().keydown().trigger('change')
        return true;
      }, data)
      .wait(1000)
      .click('#_eventId_submit')
      .wait('#windowExcessWaiverCover')
      .evaluate(function(data) {
        // excess
        if(data.excess == '500') {
          $('label[for="buildingExcess3"]').click().trigger('change') // 500
        } else if(data.excess == '750') {
          $('label[for="buildingExcess4"]').click().trigger('change') // 750
        } else if(data.excess == '1000') {
          $('label[for="buildingExcess5"]').click().trigger('change') // 1000
        }
        // $('label[for="buildingExcess1"]').click().trigger('change') // 300
        // $('label[for="buildingExcess2"]').click().trigger('change') // 400
        return true;
      }, data)
      .wait(2000)
      .evaluate(function(data) {
        // glass excess - if yes
        if(data.glassExcess) {
          $('#windowExcessWaiverCover').parent().click().trigger('change')
        }
        return true;
      }, data)
      .wait(2000)
      .evaluate(function(data) {
        // premium
        var yearly = $('.premium').first().text()
        window.localStorage.setItem('yearly', yearly.replace(/,/g, ''))
        $('button[data-paymentmode="MONTHLY"]').click()
        return true;
      }, data)
      .wait(2000)
      .evaluate(function(data) {
        var monthly = $('.premium').first().text()
        data.annualAmount = window.localStorage.getItem('yearly');
        data.monthlyAmount = monthly.replace(/,/g, '')
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

    var output = "";

    function coreFunction() {
      nightmare
        .wait('.address-picker')
        .wait(1000)
        .evaluate(function(data) {
          jQuery('div[name="CoverType"] .radio-item-content').eq(1).click()
          jQuery('.address-picker input.search-input').val(data.street).keydown().keyup().change()
          return true;
        }, data)
        .wait(3000)
        .evaluate(function(data) {
          var search = $('.search-dropdown-menu li a:contains("' + data.postCode + '")');
          if(search.length === 0) {
            search = $('.search-dropdown-menu li a')
          }
          search.first().click();

          var house = jQuery('a[data-analytics-id="PropertyType_FreestandingHouse "]');
          if(data.buildingType.indexOf('Freestanding') > -1) {
            house = jQuery('a[data-analytics-id="PropertyType_FreestandingHouse "]');
          } else if(data.buildingType.indexOf('Townhouse') > -1) {
            house = jQuery('a[data-analytics-id="PropertyType_TownHouse "]');
          } else if(data.buildingType.indexOf('Multi-unit') > -1) {
            house = jQuery('a[data-analytics-id="PropertyType_MultiUnitDwelling "]');
          } else if(data.buildingType.indexOf('Apartment') > -1) {
            house = jQuery('a[data-analytics-id="PropertyType_Apartment "]');
          } else if(data.buildingType.indexOf('Other') > -1) {
            house = jQuery('a[data-analytics-id="PropertyType_Other "]');
          }
          jQuery(house).click();

          // for town house and multi just do this
          jQuery('a[data-analytics-id="BodyCorporate_No "]').click()

          // cladding options
          // "Aluminium, Brick, Butynol or malthoid, Concrete, Fibre cement, Iron or steel, Stone, Wooden products"
          var $cladding = jQuery('div[name="CladdingMaterial"] a:contains("' + data.constructionType + '")');
          if($cladding.length === 0) {
              $cladding = jQuery('div[name="CladdingMaterial"] a').first()
          }
          $cladding.click()

          // roofing options
          // "Concrete, Glass, Metal, Plastic, Slate, Tile profile"
          var $roofMaterial = jQuery('div[name="RoofMaterial"] a:contains("' + data.roofType + '")');
          if($roofMaterial.length === 0) {
              $roofMaterial = jQuery('div[name="RoofMaterial"] a').first()
          }
          $roofMaterial.click()

          // must only have 1 unit
          jQuery('a[data-analytics-id="SelfContainedUnitCount_1 "]').click();

          // year between 1880, 1944 and below has extra question about heritage home that must be no
          jQuery('input[name="YearBuilt"]').val(data.yearBuilt).keydown().keyup().change();

          // must be no
          jQuery('a[data-analytics-id="HouseInHeritageList_No "]').click()

          // floor area - min 1, max 399
          jQuery('input[name="FloorArea"]').val(data.dwellingFloorArea).keydown().keyup().change();

          // garage
          if(data.hasGarage == 'TRUE') {
            jQuery('a[data-analytics-id="ExternalGarageOutbuilding_Yes "]').click();
          } else {
            jQuery('a[data-analytics-id="ExternalGarageOutbuilding_No "]').click();
          }

          // garage floor area, min 1, max 199
          jQuery('input[name="ExternalGarageOutbuildingFloorArea"]').val(data.garageFloorArea).keydown().keyup().change();

          // must be no
          jQuery('a[data-analytics-id="NaturalHazardRisk_No "]').click()

          // town water supply
          if(data.townWaterSupply == 'TRUE') {
            jQuery('a[data-analytics-id="ConnectedToTownWater_Yes "]').click();
          } else {
            jQuery('a[data-analytics-id="ConnectedToTownWater_Yes "]').click();
          }

          // home use
          if(data.occupancy.toUpperCase() === 'HOLIDAY') {
            jQuery('a[data-analytics-id="HowDoYouUseYourHome_HolidayHome "]').click();
          } else if(data.occupancy.toUpperCase() === 'DON\'T') {
            jQuery('a[data-analytics-id="HowDoYouUseYourHome_Other "]').click(); // [NO QUOTE]
          } else {
            jQuery('a[data-analytics-id="HowDoYouUseYourHome_OwnerOccupied "]').click();
          }

          // if owner occupied
          if(data.boarders === 'TRUE') {
            jQuery('a[data-analytics-id="HaveBoarders_Yes "]').click();
          } else {
            jQuery('a[data-analytics-id="HaveBoarders_No "]').click();
          }

          // if owner occupied
          if(data.businessUse == 'TRUE') {
            jQuery('a[data-analytics-id="DoYouConductBusiness_Yes "]').click();
          } else {
            jQuery('a[data-analytics-id="DoYouConductBusiness_No "]').click();
          }

          // if owner occupied and business yes must select office use - other results in need to call
          jQuery('a[data-analytics-id="WhatKindOfBusiness_OfficeUse "]').click();

          // if owner occupied and business yes - cannot choose more than 50% otherwise results in call
          jQuery('a[data-analytics-id="FloorSpaceUsedForBusiness_UpTo20% "]').click();
          // jQuery('a[data-analytics-id="FloorSpaceUsedForBusiness_20-50% "]').click();

          // if holiday home ... TBD: come back to me
          if(data.occupancy.toUpperCase() === 'HOLIDAY') {
            if(data.tenants === 'TRUE' || data.boarders === 'TRUE') {
              jQuery('a[data-analytics-id="WhoUsesYourHolidayHome_RentOutAndMyself "]').click();
            } else {
              jQuery('a[data-analytics-id="WhoUsesYourHolidayHome_Myself "]').click();
            }
          }

          // sum insured... just check yes
          jQuery('a[data-analytics-id="KnowRebuildCost_Yes "]').click();

          // sum insured value - min/max dependent on floor space (min 1.6x floor area, max 5x floor area)
          jQuery('input[name="SumInsured"]').val(data.sumInsured).keyup().keydown().change();

          // dob
          var _dob = data.dob.split('-');
          var newdob = _dob[0] + '/' + _dob[1] + '/' + _dob[2];
          jQuery('input[name="OldestDateOfBirth"]').val(newdob).keyup().keydown().change();

          // made claim last two years
          if(data.previousClaim == 'TRUE') {
            jQuery('a[data-analytics-id="InsuranceClaimsLast2Years_Yes "]').click();
          } else {
            jQuery('a[data-analytics-id="InsuranceClaimsLast2Years_No "]').click();
          }

          // if yes to above, then choose
          jQuery('a[data-analytics-id="NumberOfClaimsMade_1 "]').click();
          // jQuery('a[data-analytics-id="NumberOfClaimsMade_2 "]').click();
          // jQuery('a[data-analytics-id="NumberOfClaimsMade_3 "]').click();
          // jQuery('a[data-analytics-id="NumberOfClaimsMade_4OrMore "]').click();

          // other policies
          if(data.haveTowerPolicies == 'TRUE') {
            jQuery('a[data-analytics-id="OtherPoliciesWithTower_Yes "]').click();
          } else {
            jQuery('a[data-analytics-id="OtherPoliciesWithTower_No "]').click();
          }

          // if yes to other policies, choose amount
          jQuery('a[data-analytics-id="NumberOfOtherPolicies_1 "]').click();
          // jQuery('a[data-analytics-id="NumberOfOtherPolicies_2OrMore "]').click();
          return true;
        }, data)
        .wait(1000)
        .evaluate(function(data) {
          // click next button
          jQuery('button[data-analytics-id="Next"]').click()
          return true;
        }, data)
        .wait('#totalPremiumMonthly')
        .evaluate(function(data) {
          // standard only
          jQuery('a[data-analytics-id="House_Cover_Standard "]').click();
          // jQuery('a[data-analytics-id="House_Cover_Plus "]').click();
          // jQuery('a[data-analytics-id="House_Cover_Premium "]').click();

          // excess
          if(data.excess == '500') {
            jQuery('a[data-analytics-id="House_Excess_500 "]').click();
          } else if(data.excess == '750') {
            jQuery('a[data-analytics-id="House_Excess_750 "]').click();
          } else if(data.excess == '1000') {
            jQuery('a[data-analytics-id="House_Excess_1000 "]').click();
          }
          return true;
        }, data)
        .wait(1000)
        .evaluate(function(data) {
          // get values
          data.annualAmount = jQuery('#totalPremiumMonthly').text() // monthly
          data.monthlyAmount = jQuery('#totalPremiumAnnual').text(); // yearly
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
