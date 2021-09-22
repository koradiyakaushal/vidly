const express = require('express');
const winston = require('winston');
const app = express();

require('./startup/logging')();
require('./startup/routes')(app);
require('./startup/db')(app);
require('./startup/config')();
require('./startup/validation')();

app.set('view engine', 'pug');
app.set('views', './views'); //default

const port = process.env.PORT || 3000;
const server = app.listen(port, () => { winston.info("Server listening request on port 3000...") })

module.exports = server;
