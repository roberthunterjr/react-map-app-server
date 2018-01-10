const router = require('express').Router();
const helper = require('./helpers.js');

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

router.get('/getPlaces', (req, res) => {
  
  console.log(req.query.address);
  res.send(req.query.address);
})

module.exports = router;
