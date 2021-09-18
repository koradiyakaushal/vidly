const mongoose = require('mongoose');
const winston = require('winston');

// const morgan = require('morgan');
// const logger = require('../middleware/logger');

module.exports = function (app) {
    if (app.get('env') === 'development') {
        // app.use(morgan('tiny'));
        // console.log('morgan is enabled...')
        mongoose.connect('mongodb://localhost/vidly')
            .then(() => winston.info('connected to mongodb'))
    }
}
