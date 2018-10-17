var mongoDB = require('mongoose');
var Promise = require('bluebird');
var responsesSchema = require('../models/responses');
var responses = mongoDB.model("responses", responsesSchema);
responsesPromise = Promise.promisifyAll(responses);
var responses_operations = {};

responses_operations.count = function(id) {
    return responsesPromise.count({"url_id": id});
}

responses_operations.findAll = function(id) {
    return responsesPromise.find({"url_id": id}).sort({time:-1});
}

responses_operations.findHundred = function(id) {
    return responsesPromise.find({"url_id": id}).sort({time:-1}).limit(100);
}

responses_operations.create = function(data) {
	return responsesPromise.create(data);
}

responses_operations.getResponseAtPosition = function(urlId, position) {
	return responsesPromise
          .find({"url_id": urlId})
          .sort({response_time:1})
          .skip(position-1)
          .limit(1);
}

responses_operations.deleteAll = function(urlId) {
  return responsesPromise
          .remove({"url_id": urlId});
}


module.exports = responses_operations;
