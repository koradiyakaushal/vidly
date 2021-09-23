const express = require('express');
const error = require('../middleware/error');
const helmet = require("helmet");

const genres = require('../routes/genres');
const customers = require('../routes/customers');
const rentals = require('../routes/rentals');
const movies = require('../routes/movies');
const users = require('../routes/users');
const auth = require('../routes/auth');
const home = require('../routes/home');
const returns = require('../routes/returns');


module.exports = function (app){
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));
    app.use(express.static('public'));
    app.use(helmet());
    
    app.use('/', home);
    app.use('/api/genres', genres);
    app.use('/api/customers', customers);
    app.use('/api/users', users);
    app.use('/api/movies', movies);
    app.use('/api/rentals', rentals);
    app.use('/api/auth', auth);
    app.use('/api/return', returns);

    app.use(error);
};
