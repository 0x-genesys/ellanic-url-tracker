var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const config = require('config');
var mongodbApi = config.get('mongodb');
global.Promise=require("bluebird")

var indexRouter = require('./routes/index');

var app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/urls', indexRouter);

var Mongoose = Promise.promisifyAll(require("mongoose"));

Mongoose.connect(mongodbApi)
	.then(function(response) {
		console.log("MONGO DB STATUS "+ response)
	})
	.catch(function(err) {
        console.log("error "+JSON.stringify(err))
  });


module.exports = app;
