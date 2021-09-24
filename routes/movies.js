const express = require('express');
const router = express.Router()
const mongoose = require('mongoose');
const { Movie, validate } = require('../models/movie');
const { Genre } = require('../models/genre');
const auth = require('../middleware/auth');
const validateObjectId = require('../middleware/validateObjectId');

router.get('/', async (req, res) => {
    const movies = await Movie.find().sort("name");
    res.send(movies);
});

router.get('/:id', validateObjectId, async (req, res) => {
    let movie = await Movie.findById(req.params.id)
    if (!movie) return res.status(404).send("Not found")

    res.send(movie);
});

router.post('/', auth, async (req, res) => {
    const { error } = validate(req.body);
    if (error) { return res.status(400).send(error); }

    const genre = await Genre.findById(req.body.genreId);

    if (!genre) {
        return res.status(400).send('Invalid Genre');
    }

    let movie = new Movie({
        title: req.body.title,
        genre: {
            _id: genre._id,
            name: genre.name
        },
        numberInStock: req.body.numberInStock,
        dailyRentalRate: req.body.dailyRentalRate
    })
    movie = await movie.save()
    return res.status(200).send(movie);
});

router.put('/:id', [auth, validateObjectId], async (req, res) => {
    const { error } = validate(req.body);
    if (error) { return res.status(400).send(error); }

    const genre = await Genre.findById(req.body.genreId);
    if (!genre) {
        res.status(400).send('Invalid Genre');
        return;
    }

    let movie = await Movie.findByIdAndUpdate(req.params.id, {
        title: req.body.title,
        genre: {
            _id: genre.id,
            name: genre.name
        },
        numberInStock: req.body.numberInStock,
        dailyRentalRate: req.body.dailyRentalRate
    }, {new: true})

    if (!movie) return res.status(404).send("Not found")

    return res.send(movie);

})

router.delete('/:id', [auth, validateObjectId], async (req, res) => {
    let movie = await Movie.findByIdAndRemove(req.params.id)

    if (!movie) return res.status(404).send("Not found")

    return res.send(movie);
});


module.exports = router;
