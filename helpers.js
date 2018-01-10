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

//Creates an array of objects from the intersection hash table
/*
[
  {
    place_id: <id>,
    location: [<Lat>,<Lng>]
  }
]
*/
const coordArrayFromIntersection = (intersectObj) => {
  let coordArray = []
  for(let place in intersectObj) {
    const location = intersectObj[place].geometry.location;
    const params = {
      place_id: place,
      location: [location.lat, location.lng]
    }
    coordArray.push(params);
  }
  return coordArray;
};


// Calculates array of distances based on origins and destinations
const getDistanceMatrix = (origins, destinations) => {
  return new Promise(function(resolve, reject) {
    const params = {
      origins,
      destinations,
      units: 'imperial'
    };
    return gmc.distanceMatrix(params, (err, results) => {
      if(!err) {
        resolve(results.json.rows);
      }
      reject(err);
    })
  });
}

// Inserts distance information based on location of returned distance rows;
const insertDistancesToIntersectMap = (places) => {
  for(let i = 0; i < places.coordArray.length; i++) {
    let cA = places.coordArray[i];
    let dA = places.distanceArray;
    cA['dist_one'] = dA[0].elements[i].distance.value;
    cA['dist_two'] = dA[1].elements[i].distance.value;
    cA['dist_sum'] = cA['dist_one'] + cA['dist_two'];
  }
  return places;
}

// Sorts coordArray by total distance
const sortCoordByTotalDistance = (places) => {
  return places.coordArray.sort((a, b) => {
    return a['dist_sum'] - b['dist_sum'];
  })
}

//Returns object reference which will point to better formatted array for front endPoint

const finalizeFormat = (places) => {
  for(let i = 0; i < places.coordArray.length; i++) {
    let cA = places.coordArray[i];
    let pIM = places.intersectMap;
    cA.name = pIM[cA.place_id].name;
    cA.photos = pIM[cA.place_id].photos;
    cA.rating = pIM[cA.place_id].rating;
    cA.vicinity = pIM[cA.place_id].vicinity;
    cA.types = pIM[cA.place_id].types;
  }
  return places.coordArray;
}

// main function called by the API endPoint
module.exports.getPlacesInRange = (add1, add2) => {
  let placesObj = {};
  return getGeoPair(add1, add2)
    .then((locationPair) => {
      placesObj['origins'] = locationPair;
      return locationPair;
    })
    .then((result) => {
      return getIntersectionOfPlaces(result[0],result[1]);
    })
    .then((intersection) => {
      placesObj['intersectMap'] = intersection;
      return coordArrayFromIntersection(intersection);
    })
    .then((coordArray) => {
      placesObj['coordArray'] = coordArray;
      let destinations = [];
      for(let place of coordArray) {
        destinations.push(place.location);
      }
      placesObj['destinations'] = destinations
      return destinations;
    })
    .then((destinations) => {
      return getDistanceMatrix(placesObj.origins, placesObj.destinations);
    })
    .then((distancesArray) => {
      placesObj['distanceArray'] = distancesArray;
      return insertDistancesToIntersectMap(placesObj);
    })
    .then((places) => {
      return sortCoordByTotalDistance(places)
    })
    .then((sortedCoordPlaces) => {
      return finalizeFormat(placesObj);
    })
}
