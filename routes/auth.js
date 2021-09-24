const express = require('express');
const router = express.Router();
const Joi = require('joi');
const _ = require('lodash');
const bcrypt = require('bcrypt');
const mongoose = require('mongoose');
const { User } = require('../models/user');

router.post('/', async (req, res) => {
    const { error } = validate(req.body);
    if (error) {
        return res.status(400).send(error);
    }
    
    let user = await User.findOne({email: req.body.email});
    if (!user) return res.status(400).send("Invalid email or password")
    // user = new User({
    //     name: req.body.name, email: req.body.email, password:req.body.password
    // })
    const validPassword = await bcrypt.compare(req.body.password, user.password)
    if (!validPassword) return res.status(400).send("Invalid email or password")

    const token = user.generateAuthToken();
    return res.status(200).send(token);

});

function validate(req){
    const schema = Joi.object({
        email: Joi.string().min(5).required().email(),
        password: Joi.string().min(5).required()
    });
    return schema.validate(req);
};

module.exports = router;
