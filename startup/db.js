const mongoose = require('mongoose');
const winston = require('winston');
const config = require('config');

// const morgan = require('morgan');
// const logger = require('../middleware/logger');

module.exports = function (app) {
    const db = config.get('db');
    mongoose.connect(db).then(() => winston.info('connected to mongodb'+db));
}
