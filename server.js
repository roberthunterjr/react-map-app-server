const app = require('express')();
const routes = require('./routes.js');

const port = 3000;

app.use('/api',routes);
app.get('/',(req, res) => {
  res.send('You are home');
});

app.listen(port, () => {
  console.log('Server listening on',port);
});
