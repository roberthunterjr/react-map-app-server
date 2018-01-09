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
const getGeoPair = (add1, add2) => {
  let pair = [getGeo(add1), getGeo(add2)];
  return Promise.all(pair)
}

// gets list of Real Estate Agencies based on the given params
const getPlacesByLocation = (location, type = KEYWORD, radius = RANGE) => {
  return new Promise(function(resolve, reject) {
    const params = {
      location,
      keyword: type,
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

//Return object of place_ids and name based on provided location
const getFilteredPlaces = (loc) => {
  return getPlacesByLocation(loc)
    .then((places) => {
      let newPlaces = {};
      for(let place of places) {
        newPlaces[place.place_id] = place
      }
      return newPlaces;
    })
}

// Return array of place_ids within given distance of provided location
const getIntersectionOfPlaces = (loc1, loc2) => {
  const pairPlaces = [getFilteredPlaces(loc1), getFilteredPlaces(loc2)]
  return Promise.all(pairPlaces)
    .then((filteredPair) => {
      const intersection = getIntersection(filteredPair[0],filteredPair[1]);
      return intersection;
    })
}

// Get intersection hash table of keys mapped to intersecting place_id objects
const getIntersection = (obj1, obj2) => {
  let intersection = {};
  for(key in obj1) {
    if(obj2[key]) {
      intersection[key] = obj2[key];
    }
  }
  return intersection;
};

//Creates a hash map of plac_ids => loc coordinates from the intersection hash table
/*
{
<id> : [<Lat>, <Long>]
}

*/
const coordMapFromIntersection = (intersectObj) => {
  let coordMap = {}
  for(let place in intersectObj) {
    const location = intersectObj[place].geometry.location;
    coordMap[place] = [location.lat, location.lng];
  }
  return coordMap;
};

// main function called by the API endPoint
module.exports.getPlacesInRange = (add1, add2) => {
  return getGeoPair(DUMMY_ADDRESS_0, DUMMY_ADDRESS_1)
    .then((result) => {
      console.log('This is the result', result);
      return result;
    })
    .then((result) => {
      return getIntersectionOfPlaces(result[0],result[1]);
    })
    .then((intersection) => {
      return coordMapFromIntersection(intersection);
    })
}
