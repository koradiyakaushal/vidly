require('express-async-errors');
const winston = require('winston');
require('winston-mongodb');

module.exports = function() {
    
    // process.on('uncaughtException', (ex) => {
    //     winston.error(ex.message, ex);
    //     process.exit(1);
    // })

    winston.exceptions.handle(
        new winston.transports.Console({ colorize: true, prettyPrint: true }),
        new winston.transports.File({ filename: 'uncaughtExceptions.log'})
    );
    
    // winston.rejections.handle(
    //     new winston.transports.File({ filename: 'unhandledRejections.log' })
    // );

    process.on('unhandledRejection', (ex) => {
        throw ex;
        winston.error(ex.message, ex);
        // process.exit(1);
    })

    winston.add(new winston.transports.File({ filename : 'logfile.log'}));
    winston.add(new winston.transports.MongoDB({ db: 'mongodb://localhost/vidlylogs', level: 'error' }));

};
