const Joi = require('joi');
const mongoose = require('mongoose');
const moment = require('moment');

const customerSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        minlength: 5,
        maxlength: 50
    },
    isGold: {
        type: Boolean,
        required: true
    },
    phone: {
        type: String,
        required: true,
        minlength: 5,
        maxlength: 50
    }
});

const rentalSchema = new mongoose.Schema({
    customer: {
        type: customerSchema,
        required: true
    },
    movie: {
        type: new mongoose.Schema({
            title:{
                type: String,
                required: true,
                trim: true,
                minlength: 5,
                maxlength: 255
            },
            dailyRentalRate: {
                type: Number,
                required: true,
                min: 0,
                max: 255
            }
        }),
        required: true
    },
    dateOut: {
        type: Date,
        required: true,
        default: Date.now
    },
    dateReturned: {
        type: Date
    },
    rentalFee: {
        type: Number,
        min: 0
    }
});

rentalSchema.statics.lookup = function(customerId, movieId) {
    return this.findOne({'customer._id': customerId, 'movie._id': movieId})
}

rentalSchema.methods.return = function() {
    this.dateReturned = new Date();
    this.rentalFee = moment().diff(this.dateOut, 'days') * this.movie.dailyRentalRate

}
const Rental = mongoose.model('Rental', rentalSchema);

function validateRental(rental){
    const schema = Joi.object({
        customerId: Joi.objectId().required(),
        movieId: Joi.objectId().required(),
    });
    return schema.validate(rental);
};

exports.Rental = Rental;
exports.validate = validateRental;
