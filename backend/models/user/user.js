const mongoose = require('mongoose');
const Joi = require('joi');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        minlength: 2
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true
    },
    password: {
        type: String,
        required: true,
        minlength: 6
    },
    role:{
        type:String,
        enum:['user','admin',"agency"],
        default:'user',
        required:true
    }
});

// Joi Validation Schema
const validateUser = (data) => {
    const schema = Joi.object({
        name: Joi.string().min(2).required(),
        email: Joi.string().email().required(),
        password: Joi.string().min(6).required()
    });

    return schema.validate(data);
};

const User = mongoose.model('User', userSchema);

module.exports = { User, validateUser };
