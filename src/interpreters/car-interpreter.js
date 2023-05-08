import moment from 'moment';

// utility function
var parseLicenseType = function(type) {
  switch(type) {
    case 'NEW ZEALAND FULL LICENCE':
      return 'Full';
    case 'LEARNERS LICENCE':
      return 'Learners';
    case 'RESTRICTED LICENCE':
      return 'Restricted';
    case 'INTERNATIONAL LICENCE':
      return 'International'
    default:
      return 'Full';
  }
}

// utility function
var parseTransmission = function(type) {
  if(type.indexOf('Automatic') > -1) {
    return 'AUTO';
  } else if(type.indexOf('Manual') > -1) {
    return 'MAN';
  } else {
    return 'AUTO'
  }
}

// utility function
var parseIncidentType = function(type) {
  if(type === 'At fault - other vehicle involved') {
    return 'at fault';
  } else if(type == 'At fault - Fire damage or theft') {
    return 'theft';
  } else if(type == 'Not at fault - other vehicle involved') {
    return 'not at fault'
  } else if(type == 'Not at fault - no other vehicle involved') {
    return 'no vehicle'
  } else {
    return 'other';
  }
}

// convert JSON into extended JSON that we use for filling out the website
var jsonInterpreter = function(json) {
  // should allow parsing of new output excel
  var maxCount = json.length
  if(json.length < maxCount) {
    maxCount = json.length;
  }
  var output = [];
  // if we already have processed, skip those which have annual amount
  if(json[0].sumInsured) {
    for(var i = 0; i < maxCount; i++) {
      var item = json[i];
      if(item.dob.indexOf('/') > -1) {
        item.dob = moment(item['DOB'], 'DD/MM/YYYY').isValid() ? moment(item['DOB'], 'DD/MM/YYYY').format('DD-MM-YYYY') : '';
        item.incidentsDate = moment(item['Date_of_incident'], 'DD/MM/YYYY').isValid() ? moment(item['Date_of_incident'], 'DD/MM/YYYY').format('DD-MM-YYYY') : '';
      }
      if(!item.annualAmount) {
        output.push(item);
      }
    }
    return output;
  }
  // when using normal excel data file
  for(var i = 0; i < maxCount; i++) {
    var item = json[i];
    var streetNo = item['Street_number'].match(/\d/g);
    if(streetNo) {
      streetNo = streetNo.join('');
    } else {
      streetNo = item['Street_number'];
    }
    var street = streetNo + ' ' + item['Street_name'] + ' ' + item['Street_type'];
    var address = street + ' ' + item['Suburb'] + ' ' + item['Postcode'];
    street = street.replace(/#/g, '');
    address = address.replace(/#/g, '');
    output.push({
      sampleNumber: item['Sample Number'],
      aaMember: item['AAMember'].toUpperCase() === 'YES' ? 'TRUE' : 'FALSE',
      additionalDrivers: item['Additional Drivers'].toUpperCase() === 'YES' ? 'TRUE' : 'FALSE',
      address: address,
	    addressStateAmi: streetNo + ' ' + item['Street_name'] + ' ' + item['Street_type'] + ' ' + item['Postcode'], 
	    age:item['Age'],
      ageLearners:item['Age_learners_AMISTATE'],
      amiFreeBmax:item['amiFreeBmax'].toUpperCase() === 'YES' ? 'TRUE' : 'FALSE',
      business:item['BusinessUser'].toUpperCase() === 'YES' ? 'TRUE' : 'FALSE',
      body: item['Body'],
      coverType:item['CoverType'],
      currentInsurer:item['CurrentInsurer'].toUpperCase() === 'YES' ? 'TRUE' : 'FALSE',
      dob: moment(item['DOB'], 'DD/MM/YYYY').isValid() ?  moment(item['DOB'], 'DD/MM/YYYY').format('DD-MM-YYYY') : '',
      engine:item['Engine'],
      engineSize: item['CC'],
      excess:item['Excess'],
      excludeUnder25:item['ExcludeUnder25'].toUpperCase() === 'YES' ? 'TRUE' : 'FALSE',
      finance: item['FinancePurchase'].toUpperCase() == 'YES' ?  'TRUE' : 'FALSE',
      gas:item['Gas'],
      gender: item['Gender'],

      immobiliser: item['Immobiliser_alarm'].toUpperCase() === 'YES' ? 'TRUE' : 'FALSE', // ?
      incidents: Number(item['Incidents_number']) > 0 ? 'TRUE' : 'FALSE',
      incidentsNumber: Number(item['Incidents_number']),
      incidents2Years: item['Incidents_last2years_TOWER'].toUpperCase() === 'YES' ? 'TRUE' : 'FALSE',
      incidents3Years: item['Incidents_last3years_AA'].toUpperCase() === 'YES' ? 'TRUE' : 'FALSE',
      incidents5Years: item['Incidents_last5years_AMISTATE'].toUpperCase() === 'YES' ? 'TRUE' : 'FALSE',
      incidentsType: parseIncidentType(item['Type_incident']),
      incidentsDate: moment(item['Date_of_incident'], 'DD/MM/YYYY').isValid() ?  moment(item['Date_of_incident'], 'DD/MM/YYYY').format('DD-MM-YYYY') : '',

      licenceType: parseLicenseType(item['Licence']),
      licenceYears: item['License_years_TOWER'],
      make: item['Manufacturer'],
      model: item['Model'],
      modifications: item['Modifications'].toUpperCase() === 'YES' ? 'TRUE' : 'FALSE',
      monthsSinceIncident:item['Months_since_incident'],
      otherPolicies:item['OtherPolicies'].toUpperCase() === 'YES' ? 'TRUE' : 'FALSE',
      parking:item['Parking'].toLowerCase() === 'locked garage' ? 'locked': 'unlocked',
      postCode: item['Postcode'],
      street: street,
      streetName: item['Street_name'] + ' ' + item['Street_type'],
	    streetNamePostCode: item['Street_name'] + ' ' + item['Street_type'] + ', ' + item['Postcode'],
      suburb: item['Suburb'].replace(/#/g, ''),
	    suburbPostCode: item['Suburb'].replace(/ /g, '') + ', ' + item['Postcode'],
      sumInsured: item['AgreedValue'],
      transmission: parseTransmission(item['Gearbox']),
      variant: item['Type'],
      year: item['Vehicle_year'],

      annualAmount: '',
      monthlyAmount: ''
    })
  }
  return output;
}

export default jsonInterpreter;