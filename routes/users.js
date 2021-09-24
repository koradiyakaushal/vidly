const express = require('express');
const router = express.Router()
const _ = require('lodash');
const bcrypt = require('bcrypt');
const mongoose = require('mongoose');
const { User, validate } = require('../models/user');
const auth = require('../middleware/auth');

// router.get('/', async (req, res) => {
//     const users = await User.find().sort("name");
//     res.send(users);
// });

// router.get('/:id', async (req, res) => {
//     let user = await User.findById(req.params.id)
//     if (!user) return res.send(404, "Not found")

//     res.send(user);
// });

router.post('/', async (req, res) => {
    const { error } = validate(req.body);
    if (error) { return res.status(400).send(error); }
    
    let user = await User.findOne({email: req.body.email});
    if (user) return res.status(400).send("user already registered")
    // user = new User({
    //     name: req.body.name, email: req.body.email, password:req.body.password
    // })
    user = new User(_.pick(req.body, ['name', 'email', 'password']))
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(user.password, salt);
    user = await user.save()

    const token = user.generateAuthToken();
    return res.header('x-auth-token', token).send(_.pick(user, ['name', 'email', '_id']));

});

// router.put('/:id', async (req, res) => {
//     const { error } = validate(req.body);
//     if (error) {
//         res.status(400).send(error);
//         console.log(error);
//         return;
//     }

//     let user = await User.findByIdAndUpdate(req.params.id, {name: req.body.name, email: req.body.email, password:req.body.password}, {new: true})
//     if (!user) return res.send(404, "Not found")

//     return res.send(user);

// })

// router.delete('/:id', async (req, res) => {
//     let user = await User.findByIdAndRemove(req.params.id)

//     if (!user) return res.send(404, "Not found")

//     return res.send(user);
// });


module.exports = router;
