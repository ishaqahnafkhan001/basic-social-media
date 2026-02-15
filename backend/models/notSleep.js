const mongoose = require('mongoose');

const sleepSchema = mongoose.Schema({
    msg: String
});

const Sleep = mongoose.model('sleep', sleepSchema);
module.exports = Sleep;
