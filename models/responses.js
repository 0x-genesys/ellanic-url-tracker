var mongoose = require('mongoose');

var url = mongoose.Schema({
        url_id: String,
        response_time: Number,
        time: Date,
        response: Number //200, 504 etc
});

module.exports = url;
