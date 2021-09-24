const express = require('express');
const winston = require('winston');
const app = express();
const morgan = require('morgan');

require('./startup/logging')();
require('./startup/routes')(app);
require('./startup/db')(app);
require('./startup/config')();
require('./startup/validation')();
require('./startup/prod')(app);

app.use(morgan('combined'))
app.set('view engine', 'pug');
app.set('views', './views'); //default

const port = process.env.PORT || 3000;
const server = app.listen(port, () => console.log("Server listening request on port 3000..."));

module.exports = server;
