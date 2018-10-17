var mongoDB = require('mongoose');
var Promise = require('bluebird');
var urlsSchema = require('../models/urls');
var urls = mongoDB.model("urls", urlsSchema);
urlsPromise = Promise.promisifyAll(urls);
var url_operations = {};

url_operations.findOne = function(id) {
    return urlsPromise.findOne({"url_id": id});
}

url_operations.findAll = function() {
    return urlsPromise.find({});
}

url_operations.create = function(data) {
	return urlsPromise.create(data);
}

url_operations.updateOne = function(id, data) {
    return urlsPromise.update({"url_id": id}, data);
}

url_operations.deleteAll = function(urlId) {
  return urlsPromise
          .remove({"url_id": urlId});
}


module.exports = url_operations;
