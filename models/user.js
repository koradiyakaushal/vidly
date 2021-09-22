const mongoose = require('mongoose');
const joi = require('Joi');
const config = require('config');
const jwt = require('jsonwebtoken');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        minlength: 5,
        maxlength: 50    
    },
    email: {
        type: String,
        required: true,
        unique: true,
        minlength: 5,
        maxlength: 255
    },
    password: {
        type: String,
        required: true,
        minlength: 5,
        maxlength: 1024
    }
});

userSchema.methods.generateAuthToken = function () {
    return jwt.sign({ _id: this._id, isAdmin: true }, config.get('jwtPrivateKey'));
    // return jwt.sign({ _id: this._id}, "donotshare");
}

const User = mongoose.model('User', userSchema);

function validateUser(user){
    const schema = joi.object({
        name: joi.string().min(5).required(),
        email: joi.string().min(5).required().email(),
        password: joi.string().min(5).required()
    });
    return schema.validate(user);
};

exports.User = User;
exports.validate = validateUser;
