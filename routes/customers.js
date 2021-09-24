const express = require('express');
const router = express.Router()
const mongoose = require('mongoose');
const { Customer, validate } = require('../models/customer');
const auth = require('../middleware/auth');
const validateObjectId = require('../middleware/validateObjectId');

router.get('/', auth, async (req, res) => {
    const customers = await Customer.find().sort("name");
    res.send(customers);
});

router.get('/:id', [auth, validateObjectId], async (req, res) => {
    let customer = await Customer.findById(req.params.id)
    if (!customer) return res.status(404).send("Not found")

    res.send(customer);
});

router.post('/', auth, async (req, res) => {
    const { error } = validate(req.body);
    if (error) { return res.status(400).send(error); }

    let customer = new Customer({name: req.body.name, isGold: req.body.isGold, phone:req.body.phone})
    customer = await customer.save()
    return res.send(customer);
});

router.put('/:id', [auth, validateObjectId], async (req, res) => {
    const { error } = validate(req.body);
    if (error) { return res.status(400).send(error); }

    let customer = await Customer.findByIdAndUpdate(req.params.id, {name: req.body.name, isGold: req.body.isGold, phone:req.body.phone}, {new: true})
    if (!customer) return res.status(404).send("Not found")

    return res.send(customer);

})

router.delete('/:id', [auth, validateObjectId], async (req, res) => {
    let customer = await Customer.findByIdAndRemove(req.params.id)

    if (!customer) return res.status(404).send("Not found")

    return res.send(customer);
});


module.exports = router;
