var urls = {}
var urlsDb = require('../dbLayer/urls.js')
var responsesDb = require('../dbLayer/responses.js')
var _ = require('lodash');
var async = require('async');


urls.monitorNewUrl = function(req, res) {
  var url = req.body.url;
  var data = req.body.data;
  var method = req.body.method;

  if(url == undefined || method == undefined) {
      res.status(500).send({"error": "Missing param url or method"});
      return;
  }

  var url_id = randomIntInc(0,100000);

  var entry = {"url": url, "url_id": url_id, "data": data, "method": method};

  urlsDb.create(entry)
  .then(function(response) {
    res.status(200).send({"success": true, "_id": url_id});
  })
  .catch(function(error) {
    res.status(500).send({"error": "Couldn't create db entry"});
  });
}


urls.getDataOnUrl  = function(req, res) {
  var urlId = req.params.ID;

  if(urlId == undefined) {
    res.status(500).send({"error": "Missing param url or method"});
    return;
  }


  responsesDb
  .findHundred(urlId)
  .then(function(response) {
    var responsesLastHundred = _.map(response, "response_time");
    console.log(response);

    async.parallel({
        "50th_percentile": function(callback) {
                calculatePercentile(50, urlId)
                .then(function(response) {
                  callback(null, response[0]['response_time']);
                })
                .catch(function(error) {
                    res.status(500).send({"success": false});
                })
        },
        "75th_percentile": function(callback) {
                calculatePercentile(75, urlId)
                .then(function(response) {
                  callback(null, response[0]['response_time']);
                })
                .catch(function(error) {
                    res.status(500).send({"success": false});
                })
        },
        "95th_percentile": function(callback) {
                calculatePercentile(95, urlId)
                .then(function(response) {
                  callback(null, response[0]['response_time']);
                })
                .catch(function(error) {
                    res.status(500).send({"success": false});
                })
        },
        "99th_percentile": function(callback) {
                calculatePercentile(99, urlId)
                .then(function(response) {
                  callback(null, response[0]['response_time']);
                })
                .catch(function(error) {
                  res.status(500).send({"success": false});
                })
        },
    }, function(err, results) {
        res.status(200).send(
          {
            "success": "true",
            "responses":responsesLastHundred,
            "percentile": results
          });
    });

  })
  .catch(function(error) {
    console.log(error);
    res.status(500).send({"error": "entry does not exist"});
  })
}


urls.editUrl = function(req, res) {
  var urlId = req.params.ID;

  if(urlId == undefined) {
    res.status(500).send({"error": "Missing param url or method"});
    return;
  }

  var url = req.body.url;
  var data = req.body.data;
  var method = req.body.method;

  urlsDb
  .findOne(urlId)
  .then(function(response) {
    console.log(response)
    if(response == undefined || response.url ==  undefined) {
      res.status(500).send({"error": "Entry not found"});
    }
    if(url) {
      response['url'] = url;
    }
    if(data) {
      response['data'] = data;
    }
    if(method) {
      response['method'] = method;
    }

    urlsDb
    .updateOne(urlId, response)
    .then(function(response) {
      res.status(200).send({"success": "true"});
    })
    .catch(function(error) {
      res.status(500).send({"success": "false"});
    })
  })
}

urls.deleteUrl = function(req, res) {
  var urlId = req.params.ID;

  if(urlId == undefined) {
    res.status(500).send({"error": "Missing param url or method"});
    return;
  }

  async.parallel({
      "delete_urls": function(callback) {
              urlsDb
              .deleteAll(urlId)
              .then(function(response) {
                callback(null, response);
              });
      },
      "delete_responses": function(callback) {
            responsesDb
            .deleteAll(urlId)
            .then(function(response) {
              callback(null, response);
            });
      }
  }, function(err, results) {
      res.status(200).send(
        {
          "success": "true",
          "results": results
        });
  });

}


urls.getUrl = function(req, res) {
    var urlId = req.query.url_id;

    if(urlId == undefined) {
      urlsDb
      .findAll()
      .then(function(response) {
          res.status(200).send({"response": response});
      })
      .catch(function(error) {
          res.status(500).send({"error": error});
      })
    }else {
      urlsDb
      .findOne(urlId)
      .then(function(response) {
          res.status(200).send({"response": response});
      })
      .catch(function(error) {
          res.status(500).send({"error": error});
      })
    }
}


function calculatePercentile(percentile, urlId) {
  var percentileDecimal = percentile/100;
  return responsesDb
  .count(urlId)
  .then(function(count) {
    var position = Math.ceil(count*percentileDecimal);

    return responsesDb.
    getResponseAtPosition(urlId, position)
    .then(function(response) {
      console.log("===>response "+response);
      return response;
    })

  })
  .catch(function(error) {
    console.log(error);
    return error;
  })
}

function randomIntInc(low, high) {
  return Math.floor(Math.random() * (high - low + 1) + low)
}

module.exports = urls;
