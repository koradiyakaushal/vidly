const startupDebugger = require('debug')('app:startup');
const dbDebugger = require('debug')('app:db');

function log(req, res, next) {
    startupDebugger(req.body);
    next();
}

module.exports = log;