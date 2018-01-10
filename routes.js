const router = require('express').Router();
const helper = require('./helpers.js');

router.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});

router.get('/hello', (req, res) => {
  res.send('Hello World');
});

router.get('/testgeo', (req, res) => {
  const DUMMY_ADDRESS_0 = '6408 Convict Hill Rd, Austin Texas, 78749';
  const DUMMY_ADDRESS_1 = '2901 S Capital of Texas Hwy, Austin, TX 78746';
  helper.getPlacesInRange(DUMMY_ADDRESS_0, DUMMY_ADDRESS_1)
    .then((result) => {
      console.log('success', result);
      res.send(result);
    })
    .catch((err) => {
      console.log('testGeo Failure', err);
      res.send('There was an error that was encountered');
    });
});

router.get('/testget', (req, res) => {
  const testData = {
    one: '6408 Convict Hill Rd, Austin Texas, 78749',
    two: '2901 S Capital of Texas Hwy, Austin, TX 78746'
  }
  const reqBundle = encodeURI(JSON.stringify(testData))
  const bundle = JSON.parse(decodeURI(reqBundle));
  console.log(bundle)
  res.status(200).send(bundle);
})

router.get('/getPlaces', (req, res) => {
  const bundle = JSON.parse(decodeURI(req.query.bundle));
  helpers.getPlacesInRange(bundle.one, bundle.two)
  .then((result) => {
    res.send(result);
  })
  .catch((err) => {
    console.log('getGeo failure');
    res.status(404).send('There was an error');
  })
})

module.exports = router;
