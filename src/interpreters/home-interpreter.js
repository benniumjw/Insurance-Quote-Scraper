import moment from 'moment';

var parseIncidentType = function(type) {
  return 'Accidental';
}

/* OCCUPANCY PARSING */
var parseOccupancy = function(type, boarders, tenants, scraperName) {
  var tmpType = type.toLowerCase();
  if (scraperName === 'AMI') {
    return parseOccupancyAMI(tmpType, boarders, tenants)
  } else if (scraperName === 'AA') {
    return parseOccupancyAA(tmpType, boarders, tenants)
  } else if (scraperName === 'TOWER') {
    return parseOccupancyTower(tmpType, boarders, tenants)
  } else if (scraperName === 'STATE') {
    return parseOccupancyState(tmpType, boarders, tenants)
  }
}

var parseOccupancyAMI = function(type, boarders, tenants) {
  if (type.indexOf('owner') > -1) {
    if (boarders === 'TRUE' && tenants === 'FALSE') {
      return 'Owner + Boarder'
    } else if (boarders === 'FALSE' && tenants === 'TRUE') {
      return 'Owner + Tenants'
    } else {
      return 'Owner Occupied'
    }
  } else if (type.indexOf('holiday') > -1) {
    return 'Holiday Home'
  } else if (type.indexOf('rented') > -1) {
    if (boarders === 'TRUE') {
      return 'Boarding'
    } else {
      return 'Let to Tenants'
    }
  } else if (type.indexOf('Unoccupied') > -1) {
    return 'Unoccupied'
  } else if (type.indexOf('Let to family') > -1) {
    return 'Employee'
  } else {
    return 'Owner Occupied';
  }
}

var parseOccupancyAA = function(type, boarders, tenants) {
  if (type.indexOf('owner') > -1) {
    return 'owner'
  } else if(type.indexOf('holiday') > -1 ) {
    if (tenants === 'TRUE') {
      return 'holiday'
    } else {
      return 'landlord'
    }
  } else {
    return 'landlord'
  }
}

var parseOccupancyTower = function(type, boarders, tenants) {
  if (type.indexOf('owner') > -1) {
    return 'live'
  } else if (type.indexOf('holiday') > -1) {
    if (tenants === 'TRUE') {
      return 'holiday'
    } else {
      return 'live'
    }
  } else {
    return 'don\'t live';
  }
}

var parseOccupancyState = function(type, boarders, tenants) {
  if (type.indexOf('owner') > -1) {
    if (boarders === 'TRUE' && tenants === 'FALSE') {
      return 'boarder'
    } else if (boarders === 'FALSE' && tenants === 'TRUE') {
      return 'tenants'
    } else {
      return 'Owner occupied'
    }
  } else if (type.indexOf('holiday') > -1) {
    return 'holiday'
  } else if (type.indexOf('rented') > -1) {
    return 'Tenants'
  } else if (type.indexOf('Unoccupied') > -1) {
    return 'Unoccupied'
  } else if (type.indexOf('Let to family') > -1) {
    return 'Tenants'
  } else {
    return 'Owner Occupied';
  }
}
/* END OCCUPANCY PARSING */

/* BUILDING TYPE PARSING */
var parseBuildingType = function(type, scraperName) {
  var tmpType = type.toLowerCase();
  if (scraperName === 'AMI') {
    return parseBuildingTypeAMI(tmpType)
  } else if (scraperName === 'AA') {
    return parseBuildingTypeAA(tmpType)
  } else if (scraperName === 'TOWER') {
    return parseBuildingTypeTower(tmpType)
  } else {
    return parseBuildingTypeState(tmpType)
  }
}

var parseBuildingTypeAMI = function(type) {
  if (type.indexOf('freestanding') > -1) {
    return 'Freestanding'
  } else if (type.indexOf('retirement') > -1) {
    return 'Retirement'
  } else if (type.indexOf('semi detached') > -1) {
    return 'detached';
  } else if (type.indexOf('multi unit (less than 5)') > -1) {
    return 'Flat'
  } else if (type.indexOf('apartment') > -1) {
    return 'Apartment'
  } else {
    return 'Boarding'
  }
}
var parseBuildingTypeAA = function(type) {
  if (type.indexOf('freestanding') > -1) {
    return 'Freestanding'
  } else if (type.indexOf('retirement') > -1) {
    return 'Multi-unit (part of 5 or more)'
  } else if (type.indexOf('semi detached') > -1) {
    return 'Multi-unit (part of 4 or less)';
  } else if (type.indexOf('multi unit (less than 5)') > -1) {
    return 'Multi-unit (part of 4 or less)'
  } else if (type.indexOf('apartment') > -1) {
    return 'Apartment'
  } else {
    return 'Multi-unit (part of 5 or more)'
  }
}
var parseBuildingTypeTower = function(type) {
  if (type.indexOf('freestanding') > -1) {
    return 'Freestanding'
  } else if (type.indexOf('retirement') > -1) {
    return 'Other'
  } else if (type.indexOf('semi detached') > -1) {
    return 'Townhouse';
  } else if (type.indexOf('multi unit (less than 5)') > -1) {
    return 'Multi-unit'
  } else if (type.indexOf('apartment') > -1) {
    return 'Apartment'
  } else {
    return 'Other'
  }
}
var parseBuildingTypeState = function(type) {
  if (type.indexOf('freestanding') > -1) {
    return 'More than one dwelling'
  } else {
    return 'Less than one dwelling'
  }
}
/* END BUILDING TYPE PARSING */

/* CONSTRUCTION TYPE PARSING */
var parseConstructionType = function(type, scraperName) {
  var tmpType = type.toLowerCase();
  if (scraperName === 'AMI') {
    return parseConstructionTypeAMI(tmpType)
  } else if (scraperName === 'AA') {
    return parseConstructionTypeAA(tmpType)
  } else if (scraperName === 'TOWER') {
    return parseConstructionTypeTower(tmpType)
  } else {
    return parseConstructionTypeState(tmpType)
  }
  // if(tmpType === 'brick veneer') {
  //   return 'Brick';
  // } else if(tmpType.indexOf('concrete block') > -1) {
  //   return 'Concrete Block';
  // } else if(tmpType.indexOf('fibre') > -1 && scraperName != 'AA') {
  //   return 'Fibre';
  // } else if(tmpType.indexOf('cement') > -1 && scraperName != 'AA') {
  //   return 'Cement';
  // } else if(tmpType.indexOf('double brick') > -1) {
  //   return 'Double';
  // } else if(tmpType.indexOf('mud brick') > -1 && scraperName != 'AA') {
  //   return 'Mud';
  // } else if(tmpType.indexOf('metal') > -1 && scraperName != 'AA') {
  //   return 'Metal';
  // } else if(tmpType.indexOf('rockcote') > -1 && scraperName != 'AA') {
  //   return 'Rockcote';
  // } else if(tmpType.indexOf('stone') > -1 && scraperName != 'AA') {
  //   return 'Stone';
  // } else if(tmpType.indexOf('timber') > -1 && scraperName != 'AA') {
  //   return 'Timber';
  // } else if(tmpType.indexOf('cladding') > -1 && scraperName != 'AA') {
  //   return 'Timber';
  // } else if(tmpType.indexOf('cladding') > -1 && scraperName == 'AA') {
  //   return 'Cladding';
  // } else if(tmpType.indexOf('aluminium') > -1 && scraperName == 'AA') {
  //   return 'Aluminium' // aa only
  // } else if(tmpType.indexOf('fibro') > -1 && scraperName == 'AA') {
  //   return 'Fibro' // AA only
  // } else if(tmpType.indexOf('hardi') > -1 && scraperName == 'AA') {
  //   return 'Hardi' // AA only
  // } else if(tmpType.indexOf('weatherboard') > -1 && scraperName == 'AA') {
  //   return 'Weatherboard' // AA only
  // } else if(tmpType.indexOf('timber') > -1 && scraperName != 'TOWER') {
  //   return 'Wodden';
  // }else {
  //   return 'Timber' // default
  // }
}

var parseConstructionTypeAMI = function(type) {
  if(type === 'brick veneer') {
    return 'Brick Veneer'
  } else if (type === 'concrete block') {
    return 'Concrete Block Veneer'
  } else if (type === 'double brick') {
    return 'Double Brick'
  } else if (type === 'fibre cement') {
    return 'Fibre'
  } else if (type === 'mud brick') {
    return 'Mud Brick'
  } else if (type === 'metal') {
    return 'Metal'
  } else if (type === 'stone') {
    return 'Natural Stone'
  } else if (type === 'rockcote eps') {
    return 'Rockcote EPS'
  } else if (type === 'concrete') {
    return 'Solid Concrete'
  } else if (type === 'stucco') {
    return 'Stucco'
  } else if (type === 'timber / weatherboard') {
    return 'Timber/Weatherboard'
  } else if (type === 'cladding') {
    return 'Timber/Weatherboard'
  } else if (type === 'hardiplank/hardiflex') {
    return 'Fibre Cement'
  } else if (type === 'aluminium') {
    return 'Metal'
  } else if (type === 'butynol or malthoid') {
    return 'Fibre Cement'
  } else {
    return 'Brick'
  }
}
var parseConstructionTypeAA = function(type) {
  if(type === 'brick veneer') {
    return 'BrickvVeneer'
  } else if (type === 'concrete block') {
    return 'Concrete'
  } else if (type === 'double brick') {
    return 'Double Brick'
  } else if (type === 'fibre cement') {
    return 'Fibro/Asbestos'
  } else if (type === 'mud brick') {
    return 'Brick Veneer'
  } else if (type === 'metal') {
    return 'Aluminium'
  } else if (type === 'stone') {
    return 'Concrete'
  } else if (type === 'rockcote eps') {
    return 'Fibro/Asbestos'
  } else if (type === 'concrete') {
    return 'Concrete'
  } else if (type === 'stucco') {
    return 'Fibro/Asbestos'
  } else if (type === 'timber / weatherboard') {
    return 'Weatherboard/Wood'
  } else if (type === 'cladding') {
    return 'Vinyl Cladding'
  } else if (type === 'hardiplank/hardiflex') {
    return 'Hardiplank/Hardiflex'
  } else if (type === 'aluminium') {
    return 'Aluminium'
  } else if (type === 'butynol or malthoid') {
    return 'Fibro/Asbestos'
  } else {
    return 'Brick'
  }
}
var parseConstructionTypeTower = function(type) {
  if(type === 'brick veneer') {
    return 'Brick'
  } else if (type === 'concrete block') {
    return 'Concrete'
  } else if (type === 'double brick') {
    return 'Brick'
  } else if (type === 'fibre cement') {
    return 'Fibre cement'
  } else if (type === 'mud brick') {
    return 'Brick'
  } else if (type === 'metal') {
    return 'Iron or steel'
  } else if (type === 'stone') {
    return 'Stone'
  } else if (type === 'rockcote eps') {
    return 'Fibre cement'
  } else if (type === 'concrete') {
    return 'Concrete'
  } else if (type === 'stucco') {
    return 'Fibre cement'
  } else if (type === 'timber / weatherboard') {
    return 'Wooden products'
  } else if (type === 'cladding') {
    return 'Wooden products'
  } else if (type === 'hardiplank/hardiflex') {
    return 'Fibre cement'
  } else if (type === 'aluminium') {
    return 'Aluminium'
  } else if (type === 'butynol or malthoid') {
    return 'Butynol or malthoid'
  } else {
    return 'Brick'
  }
}
var parseConstructionTypeState = function(type) {
  if(type === 'brick veneer') {
    return 'Brick veneer'
  } else if (type === 'concrete block') {
    return 'Concrete block (Besser)'
  } else if (type === 'double brick') {
    return 'Double brick'
  } else if (type === 'fibre cement') {
    return 'Fibre cement (Fibro)'
  } else if (type === 'mud brick') {
    return 'Mud Brick'
  } else if (type === 'metal') {
    return 'Metal'
  } else if (type === 'stone') {
    return 'Rock / Stone'
  } else if (type === 'rockcote eps') {
    return 'Rockcote EPS'
  } else if (type === 'concrete') {
    return 'Cement'
  } else if (type === 'stucco') {
    return 'Fibre cement'
  } else if (type === 'timber / weatherboard') {
    return 'Timber or weatherboard'
  } else if (type === 'cladding') {
    return 'Cladding'
  } else if (type === 'hardiplank/hardiflex') {
    return 'Fibre Cement (Fibro)'
  } else if (type === 'aluminium') {
    return 'Metal'
  } else if (type === 'butynol or malthoid') {
    return 'Fibre Cement (Fibro)'
  } else {
    return 'Brick'
  }
}
/* END CONSTRUCTION TYPE PARSING */

/* ROOF TYPE PARSING */
var parseRoofType = function(type, scraperName) {
  var tmpType = type.toLowerCase();
  if (scraperName === 'AMI') {
    return parseRoofTypeAMI(tmpType)
  } else if (scraperName === 'AA') {
    return parseRoofTypeAA(tmpType)
  } else if (scraperName === 'TOWER') {
    return parseRoofTypeTower(tmpType)
  } else {
    return parseRoofTypeState(tmpType)
  }
}

var parseRoofTypeAMI = function(type) {
  if(type === 'Fibro') {
    return 'Fibro'
  } else if (type === 'Steel/colourbond') {
    return 'Tin/Colourbond'
  } else if (type === 'Concrete') {
    return 'Concrete'
  } else if (type === 'Terracotta/Clay tiles') {
    return 'Terracotta/Clay tTiles'
  } else if (type === 'Slate') {
    return 'Slate'
  } else if (type === 'Shingles') {
    return 'Shingles'
  } else if (type === 'Cement tiles') {
    return 'Cement Tiles'
  } else if (type === 'Aluminium') {
    return 'Tin/Colourbond'
  } else if (type === 'Iron (Corrugated)') {
    return 'Tin/Colourbond'
  } else if (type === 'Glass') {
    return 'Fibro'
  } else if (type === 'Abc') {
    return 'Fibro'
  } else {
    return 'Concrete'
  }
}
var parseRoofTypeAA = function(type) {
  if(type === 'Fibro') {
    return 'Fibro/Asbestos Cement'
  } else if (type === 'Steel/colourbond') {
    return 'Steel/Colourbond'
  } else if (type === 'Concrete') {
    return 'Concrete'
  } else if (type === 'Terracotta/Clay tiles') {
    return 'Slate'
  } else if (type === 'Slate') {
    return 'Slate'
  } else if (type === 'Shingles') {
    return 'Slate'
  } else if (type === 'Cement tiles') {
    return 'Slate'
  } else if (type === 'Aluminium') {
    return 'Aluminium'
  } else if (type === 'Iron (Corrugated)') {
    return 'Iron (Corrugated)'
  } else if (type === 'Glass') {
    return 'Fibro/Asbestos Cement'
  } else if (type === 'Abc') {
    return 'Fibro/Asbestos Cement'
  } else {
    return 'Concrete'
  }
}
var parseRoofTypeTower = function(type) {
  if(type === 'Fibro') {
    return 'Concrete'
  } else if (type === 'Steel/colourbond') {
    return 'Metal'
  } else if (type === 'Concrete') {
    return 'Concrete'
  } else if (type === 'Terracotta/Clay tiles') {
    return 'Tile profile'
  } else if (type === 'Slate') {
    return 'Slate'
  } else if (type === 'Shingles') {
    return 'Slate'
  } else if (type === 'Cement tiles') {
    return 'Slate'
  } else if (type === 'Aluminium') {
    return 'Metal'
  } else if (type === 'Iron (Corrugated)') {
    return 'Metal'
  } else if (type === 'Glass') {
    return 'Glass'
  } else if (type === 'Abc') {
    return 'Plastic'
  } else {
    return 'Concrete'
  }
}
var parseRoofTypeState = function(type) {
  if(type === 'Fibro') {
    return 'Fibro'
  } else if (type === 'Steel/colourbond') {
    return 'Tin/Colourbond'
  } else if (type === 'Concrete') {
    return 'Concrete'
  } else if (type === 'Terracotta/Clay tiles') {
    return 'Terracotta/Clay tiles'
  } else if (type === 'Slate') {
    return 'Slate'
  } else if (type === 'Shingles') {
    return 'Shingles'
  } else if (type === 'Cement tiles') {
    return 'Cement tiles'
  } else if (type === 'Aluminium') {
    return 'Tin/Colourbond'
  } else if (type === 'Iron (Corrugated)') {
    return 'Tin/Colourbond'
  } else if (type === 'Glass') {
    return 'Fibro'
  } else if (type === 'Abc') {
    return 'Fibro'
  } else {
    return 'Concrete'
  }
}
/* END CONSTRUCTION TYPE PARSING */

// convert JSON into extended JSON that we use for filling out the website
var jsonInterpreter = function(json, scraperName) {
  // should allow parsing of new output excel
  var maxCount = json.length
  if(json.length < maxCount) {
    maxCount = json.length;
  }
  var output = [];
  // if we already have processed, skip those which have annual amount
  if(json[0].annualAmount) {
    for(var i = 0; i < maxCount; i++) {
      var item = json[i];
      if(item.dob.indexOf('/') > -1) {
        item.dob = moment(item['DOB'], 'DD/MM/YYYY').isValid() ? moment(item['DOB'], 'DD/MM/YYYY').format('DD-MM-YYYY') : '';
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

    var boarders = item['Boarders'].toUpperCase() === 'YES' ? 'TRUE' : 'FALSE';
    var tenants = item['Tenants'].toUpperCase() === 'YES' ? 'TRUE' : 'FALSE';

    output.push({
      sampleNumber: item['Sample Number'],
      address: address,
	    addressStateAmi: streetNo + ' ' + item['Street_name'] + ' ' + item['Street_type'] + ' ' + item['Postcode'],
      postCode: item['Postcode'],
      street: street,
      streetName: item['Street_name'] + ' ' + item['Street_type'],
      streetNamePostCode: item['Street_name'] + ' ' + item['Street_type'] + ', ' + item['Postcode'],
      suburb: item['Suburb'].replace(/#/g, ''),
      suburbPostCode: item['Suburb'].replace(/ /g, '') + ', ' + item['Postcode'],

      business:item['BusinessUser'].toUpperCase() === 'YES' ? 'TRUE' : 'FALSE',

      occupancy:parseOccupancy(item['Occupancy'], boarders, tenants, scraperName),
      boarders:boarders,
      tenants:tenants,

	    age:item['Age'],
      dob: moment(item['DOB'], 'DD/MM/YYYY').isValid() ?  moment(item['DOB'], 'DD/MM/YYYY').format('DD-MM-YYYY') : '',
      gender: item['Gender'],

      carInsurance:item['CarInsurance'].toUpperCase() === 'YES' ? 'TRUE' : 'FALSE',
      contentsInsurance:item['ContentsInsurance'].toUpperCase() === 'YES' ? 'TRUE' : 'FALSE',
      farmInsurance:item['FarmInsurance'].toUpperCase() === 'YES' ? 'TRUE' : 'FALSE', // ami
      boatInsurance:item['BoatInsurance'].toUpperCase() === 'YES' ? 'TRUE' : 'FALSE', // ami
      homeCombInsurance:item['HomeCombInsurance'].toUpperCase() === 'YES' ? 'TRUE' : 'FALSE', // state

      buildingType:parseBuildingType(item['BuildingType'], scraperName),
      constructionType:parseConstructionType(item['ConstructionType'], scraperName),
      roofType:parseRoofType(item['RoofType'], scraperName),
      houseStandard:item['HouseStandard'],
      landShape:item['LandShape'],
      yearBuilt:item['YearBuilt'],
      purchaseYear:item['PurchaseYear'],
      numberOfStories:item['NumberOfStories'],
      dwellingFloorArea:item['DwellingFloorArea'],
      hasGarge:item['HasGarge'].toUpperCase() === 'YES' ? 'TRUE' : 'FALSE',
      garageFloorArea:item['GarageFloorArea'],
      glassExcess:item['GlassExcess'].toUpperCase() === 'YES' ? 'TRUE' : 'FALSE',

      previousClaim:item['PreviousClaim'].toUpperCase() === 'YES' ? 'TRUE' : 'FALSE',
      incidentsDate: moment(item['Date_of_incident'], 'DD/MM/YYYY').isValid() ?  moment(item['Date_of_incident'], 'DD/MM/YYYY').format('DD-MM-YYYY') : '',
      incidentsType: parseIncidentType(item['Type_incident']),

      // aa specific
      haveAAPolicies:item['HaveAAPolicies'].toUpperCase() === 'YES' ? 'TRUE' : 'FALSE',
      carSpaces:item['CarSpaces'],

      balcony:item['Balcony'].toUpperCase() === 'YES' ? 'TRUE' : 'FALSE',
      swimmingPool:item['SwimmingPool'].toUpperCase() === 'YES' ? 'TRUE' : 'FALSE',
      sportCourt:item['SportCourt'].toUpperCase() === 'YES' ? 'TRUE' : 'FALSE',
      gardenShed:item['GardenShed'].toUpperCase() === 'YES' ? 'TRUE' : 'FALSE',
      shed:item['Shed'].toUpperCase() === 'YES' ? 'TRUE' : 'FALSE',
      waterTanks:item['WaterTanks'].toUpperCase() === 'YES' ? 'TRUE' : 'FALSE',

      // tower only
      townWaterSupply:item['TownWaterSupply'].toUpperCase() === 'YES' ? 'TRUE' : 'FALSE',
      haveTowerPolicies:item['HaveTowerPolicies'].toUpperCase() === 'YES' ? 'TRUE' : 'FALSE',

      excess:item['Excess'],
      annualAmount: '',
      monthlyAmount: '',
      sumInsured: item['SumInsured'],

    })
  }
  return output;
}

export default jsonInterpreter;
