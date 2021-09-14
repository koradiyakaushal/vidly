const express = require('express');
const router = express.Router()
const mongoose = require('mongoose');
const Fawn = require('fawn');
const { Rental, validate } = require('../models/rental');
const { Movie } = require('../models/movie');
const { Customer } = require('../models/customer');

Fawn.init(mongoose);

router.get('/', async (req, res) => {
    const rentals = await Rental.find().sort("-dateOut");
    res.send(rentals);
});

router.get('/:id', async (req, res) => {
    let rental = await Rental.findById(req.params.id)
    if (!rental) return res.send(404, "Not found")

    res.send(rental);
});

router.post('/', async (req, res) => {
    const { error } = validate(req.body);
    if (error) {
        res.send(400, error);
        console.log(error);
        return;
    }

    const customer = await Customer.findById(req.body.customerId);
    if (!customer) {
        res.send(400, 'Invalid customer');
        return;
    }

    const movie = await Movie.findById(req.body.movieId);
    if (!movie) {
        res.send(400, 'Invalid Movie');
        return;
    }

    if (movie.numberInStock == 0) return res.status(400).send("Movie out of stock")

    let rental = new Rental({
        customer: {
            _id: customer._id,
            name: customer.name,
            phone: customer.phone
        },
        movie: {
            _id: movie._id,
            title: movie.title,
            dailyRentalRate: movie.dailyRentalRate
        },
    })

    // transaction
    try {
        new Fawn.Task()
            .save('rentals', rental)
            .update('movies', {_id: movie._id}, {
                $inc: { numberInStock: -1}
            })
            .run();
            
        return res.send(rental);
    }
    catch(ex){
        res.status(500).send('Something failed.');
    }

    // rental = await rental.save();

    // movie.numberInStock--;
    // movie.save();

});

router.put('/:id', async (req, res) => {
    const { error } = validate(req.body);
    if (error) {
        res.send(400, error);
        console.log(error);
        return;
    }

    const customer = await Customer.findById(req.body.customerId);
    if (!customer) {
        res.send(400, 'Invalid customer');
        return;
    }

    const movie = await Movie.findById(req.body.movieId);
    if (!movie) {
        res.send(400, 'Invalid Movie');
        return;
    }

    if (movie.numberInStock == 0) return res.status(400).send("Movie out of stock")

    let rental = await Rental.findByIdAndUpdate(req.params.id, {
        customer: {
            _id: customer._id,
            name: customer.name,
            phone: customer.phone
        },
        movie: {
            _id: movie._id,
            title: movie.title,
            dailyRentalRate: movie.dailyRentalRate
        },
    }, {new: true})

    if (!rental) return res.send(404, "Not found")

    return res.send(rental);

})

router.delete('/:id', async (req, res) => {
    let rental = await Rental.findByIdAndRemove(req.params.id)

    if (!rental) return res.send(404, "Not found")

    return res.send(rental);
});


module.exports = router;
