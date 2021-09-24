const express = require('express');
const router = express.Router()
const mongoose = require('mongoose');
const Fawn = require('fawn');
const { Rental, validate } = require('../models/rental');
const { Movie } = require('../models/movie');
const { Customer } = require('../models/customer');
const auth = require('../middleware/auth');
const validateObjectId = require('../middleware/validateObjectId');

// Fawn.init(mongoose);

router.get('/', auth, async (req, res) => {
    const rentals = await Rental.find().sort("-dateOut");
    res.send(rentals);
});

router.get('/:id', [auth, validateObjectId], async (req, res) => {
    let rental = await Rental.findById(req.params.id)
    if (!rental) return res.status(404).send("Not found")

    res.send(rental);
});

router.post('/', auth, async (req, res) => {
    const { error } = validate(req.body);
    if (error) { return res.status(400).send(error); }

    const customer = await Customer.findById(req.body.customerId);
    if (!customer) {
        res.status(400).send('Invalid customer');
        return;
    }

    const movie = await Movie.findById(req.body.movieId);
    if (!movie) {
        res.status(400).send('Invalid Movie');
        return;
    }

    if (movie.numberInStock == 0) return res.status(400).send("Movie out of stock")

    let rental = new Rental({
        customer: {
            _id: customer._id,
            name: customer.name,
            phone: customer.phone,
            isGold: customer.isGold
        },
        movie: {
            _id: movie._id,
            title: movie.title,
            dailyRentalRate: movie.dailyRentalRate
        },
    })

    // transaction
    // try {
    //     new Fawn.Task()
    //         .save('rentals', rental)
    //         .update('movies', {_id: movie._id}, {
    //             $inc: { numberInStock: -1}
    //         })
    //         .run();
            
    //     return res.send(rental);
    // }
    // catch(ex){
    //     res.status(500).send('Something failed.');
    // }

    rental = await rental.save();

    movie.numberInStock--;
    movie.save();
    return res.status(200).send(rental);

});

router.delete('/:id', [auth, validateObjectId], async (req, res) => {
    let rental = await Rental.findByIdAndRemove(req.params.id)

    if (!rental) return res.status(404).send("Not found")

    return res.send(rental);
});


module.exports = router;
