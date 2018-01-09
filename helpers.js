const gmc = require('@google/maps').createClient({
  key: 'AIzaSyDWctL40j8iOM_j2VFUZf9ohONax8exZPs'
});

const DUMMY_ADDRESS_0 = '6408 Convict Hill Rd, Austin Texas, 78749';
const DUMMY_ADDRESS_1 = '2901 S Capital of Texas Hwy, Austin, TX 78746';
const RANGE = 16093.4; // miles to meters
const KEYWORD = 'real_estate_agency';


// returns the provided address as a set of coordinates
const getGeo = (a) => {
  return new Promise(function(resolve, reject) {
    const params = {
      address: a
    }
    gmc.geocode(params, (err, result) => {
      if(!err) {
        const location = result.json.results[0].geometry.location
        resolve(location);
      }
      reject(err);
    });
  });
};

// returns a promise that resolves to array of coordinates for each address
const getGeoPair = (a1, a2) => {
  let pair = [getGeo(a1), getGeo(a2)];
  return Promise.all(pair)
}

// gets list of Real Estate Agencies based on the given params
const getPlaces = (location, type = KEYWORD, radius = RANGE) => {
  return new Promise(function(resolve, reject) {
    const params = {
      location,
      type,
      radius
    }
    gmc.placesNearby(params, (err, result) => {
      if(!err) {
        results = result.json.results
        resolve(results);
      }
      reject(err);
    })
  });
};

const pluckIntoSet = (array) => {
  let newSet = new Set();
  for(var el of array) {
    const props = {
      name: el.name || '',
      placeId: el.place_id || ''
    }
    newSet.add(props);
  }
  return newSet;
}
module.exports.getPlacesInRange = (address, places, range) => {
  return getGeoPair(DUMMY_ADDRESS_0, DUMMY_ADDRESS_1)
    .then((result) => {
      console.log('This is the result', result);
      return result;
    })
}
