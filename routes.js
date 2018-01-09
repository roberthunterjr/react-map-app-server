const router = require('express').Router();
const helper = require('./helpers.js')

router.get('/hello', (req, res) => {
  res.send('Hello World');
})

router.get('/testgeo', (req, res) => {
  helper.getPlacesInRange()
    .then((result) => {
      console.log('success',result);
      res.send(result);
    })
    .catch((err) => {
      console.log('testGeo Failure', err);
      res.send('There was an error that was encountered');
    })
})


module.exports = router;
