const app = require('express')();
const routes = require('./routes.js');
const bodyParser = require('body-parser');

const port = 3000;

app.listen(port);
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: false,
}));

app.get('/',(req, res) => {
  res.send('You are home');
});
app.use('/api',routes);

console.log('Server listening on',port);
