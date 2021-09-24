const express = require('express');
const router = express.Router()
const mongoose = require('mongoose');
const { Movie, validate } = require('../models/movie');
const { Genre } = require('../models/movie');
const auth = require('../middleware/auth');

router.get('/', async (req, res) => {
    const movies = await Movie.find().sort("name");
    res.send(movies);
});

router.get('/:id', async (req, res) => {
    let movie = await Movie.findById(req.params.id)
    if (!movie) return res.send(404, "Not found")

    res.send(movie);
});

router.post('/', async (req, res) => {
    const { error } = validate(req.body);
    if (error) { return res.status(400).send(error); }

    const genre = await Genre.findById(req.body.genreId);
    if (!genre) {
        res.send(400, 'Invalid Genre');
        return;
    }

    let movie = new Movie({
        title: req.body.title,
        genre: {
            _id: genre.id,
            name: genre.name
        },
        numberInStock: req.body.numberInStock,
        dailyRentalRate: req.body.dailyRentalRate
    })
    movie = await movie.save()
    return res.send(movie);
});

router.put('/:id', async (req, res) => {
    const { error } = validate(req.body);
    if (error) { return res.status(400).send(error); }

    const genre = await Genre.findById(req.body.genreId);
    if (!genre) {
        res.send(400, 'Invalid Genre');
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

    if (!movie) return res.send(404, "Not found")

    return res.send(movie);

})

router.delete('/:id', async (req, res) => {
    let movie = await Movie.findByIdAndRemove(req.params.id)

    if (!movie) return res.send(404, "Not found")

    return res.send(movie);
});


module.exports = router;
