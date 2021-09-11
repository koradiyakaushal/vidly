const express = require('express');
const router = express.Router()
const mongoose = require('mongoose');
const { Customer, validate } = require('../models/customer');

router.get('/', async (req, res) => {
    const customers = await Customer.find().sort("name");
    res.send(customers);
});

router.get('/:id', async (req, res) => {
    let customer = await Customer.findById(req.params.id)
    if (!customer) return res.send(404, "Not found")

    res.send(customer);
});

router.post('/', async (req, res) => {
    const { error } = validate(req.body);
    if (error) {
        res.send(400, error);
        console.log(error);
        return;
    }
    let customer = new Customer({name: req.body.name, isGold: req.body.isGold, phone:req.body.phone})
    customer = await customer.save()
    return res.send(customer);

});

router.put('/:id', async (req, res) => {
    const { error } = validate(req.body);
    if (error) {
        res.send(400, error);
        console.log(error);
        return;
    }

    let customer = await Customer.findByIdAndUpdate(req.params.id, {name: req.body.name, isGold: req.body.isGold, phone:req.body.phone}, {new: true})
    if (!customer) return res.send(404, "Not found")

    return res.send(customer);

})

router.delete('/:id', async (req, res) => {
    let customer = await Customer.findByIdAndRemove(req.params.id)

    if (!customer) return res.send(404, "Not found")

    return res.send(customer);
});


module.exports = router;
