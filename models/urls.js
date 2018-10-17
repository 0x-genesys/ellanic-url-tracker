var mongoose = require('mongoose');

var url = mongoose.Schema({
        url: String,
        url_id: String,
        data: {
        },
        method: String
});

module.exports = url;
