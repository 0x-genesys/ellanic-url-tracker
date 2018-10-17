var cron = require('cron');
var urlsDb = require('../dbLayer/urls.js');
var responsesDb = require('../dbLayer/responses.js')
var _ = require('lodash');
var async = require('async');
var request = require('request');


var cron_obj = {};

var cronJob = cron.job("*/10 * * * * *", function() {
    console.info('cron job started----\n\n');
    urlsDb.findAll()
    .then(function(response) {

      var asyncTasks = [];

      console.log("response " + response);

      //Create all tasks
      _.forEach(response, function(entry) {
        if(entry['method'] == "get") {
          asyncTasks.push(cron_obj.makeGetTask(entry));
        }else if(entry['method'] == "post") {
          asyncTasks.push(cron_obj.makePostTask(entry));
        }
      });

      //Execute tasks
      async.parallel(asyncTasks, function(err, results) {
					    if( err ) {
					      console.log(err);
					      throw err;
					    } else {
					    	console.log("--------DONE-----");
					    }
					});
    })
    .catch(function(error) {
      //db error
      console.log("error " + error);
    })
});

/*
GET call task
record response time
*/
cron_obj.makeGetTask = function(entry) {
  return function(callback_inner) {
      var start = new Date();
      request.get(
        entry['url'],
        entry['data'],
        function (error, response, body) {
            if (!error && response.statusCode == 200) {
                console.log( "======== 200 response for "+entry['url']);
            }
            responseTime = (new Date() - start);
            var data = {
              "url_id": entry['url_id'],
              "response_time" : responseTime,
              "time": new Date(),
              "response": response.statusCode
            }
            cron_obj.storeInMongo(data); //store in db
            callback_inner(); //callback
          }
        );
  }
}

/*
Post call task
record response time
*/
cron_obj.makePostTask = function(entry) {
  return function(callback_inner) {
    var start = new Date();
      request.post(
        entry['url'],
        entry['data'],
        function (error, response, body) {
            if (!error && response.statusCode == 200) {
              console.log( "======== 200 response for "+entry['url']);
            }
            responseTime = (new Date() - start);
            var data = {
              "url_id": entry['url_id'],
              "response_time" : responseTime,
              "time": new Date(),
              "response": response.statusCode
            }
            cron_obj.storeInMongo(data); //store in db
            callback_inner(); //callback
          }
        );
  }
}

//Store in db
cron_obj.storeInMongo = function(data) {
  responsesDb.create(data);
}

//Start cron (every 10 second). Called on npm start
cron_obj.startJob = function() {
  cronJob.start();
}


module.exports = cron_obj;
