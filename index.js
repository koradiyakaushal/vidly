const config = require('config');
const express = require('express');
const Joi = require('joi');
Joi.objectId = require('joi-objectid')(Joi);
const logger = require('./middleware/logger');
const app = express();
const helmet = require("helmet");
const morgan = require('morgan');
const genres = require('./routes/genres');
const customers = require('./routes/customers');
const home = require('./routes/home');
const mongoose = require('mongoose');

// process.env.NODE_ENV
// console.log(app.get('env'))

// console.log(config.get('name'));
// console.log(config.get('mail.host'));

app.set('view engine', 'pug');
app.set('views', './views'); //default

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));
app.use(helmet());

app.use('/', home);
app.use('/api/genres', genres);
app.use('/api/customers', customers);

if (app.get('env') === 'development') {
    app.use(morgan('tiny'));
    console.log('morgan is enabled...')
    mongoose.connect('mongodb://localhost/vidly')
        .then(() => console.log('connected to mongodb'))
        .catch((err) => console.log(err.message));
}
app.use(logger);

const port = process.env.PORT || 3000;
app.listen(port, () => { console.log("Server listening request on port 3000...") })
