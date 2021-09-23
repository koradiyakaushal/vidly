const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const { Genre, validate } = require('../models/genre');
const auth = require('../middleware/auth');
const validateObjectId = require('../middleware/validateObjectId');

router.get('/', async (req, res) => {
    const genres = await Genre.find().sort("name");
    res.send(genres);
});

router.get('/:id', validateObjectId, async (req, res) => {
    let genre = await Genre.findById(req.params.id)
    if (!genre) return res.status(404).send("Not found")

    res.send(genre);
});

router.post('/', auth, async (req, res) => {
    const { error } = validate(req.body);
    if (error) {
        res.status(400).send(error);
        // console.log(error);
        return;
    }
    let genre = new Genre({name: req.body.name})
    genre = await genre.save()
    return res.status(200).send(genre);
});

router.put('/:id', auth, async (req, res) => {
    const { error } = validate(req.body);
    if (error) {
        res.status(400).send(error);
        // console.log(error);
        return;
    }

    let genre = await Genre.findByIdAndUpdate(req.params.id, {name: req.body.name}, {new: true})
    if (!genre) return res.status(404).send("Not found")

    return res.status(200).send(genre);

})

router.delete('/:id', validateObjectId, auth, async (req, res) => {
    let genre = await Genre.findByIdAndRemove(req.params.id)

    if (!genre) return res.status(404).send("Not found")

    return res.status(200).send(genre);
});


module.exports = router;
