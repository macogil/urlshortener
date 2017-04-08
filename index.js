var express = require ('express');
var path = require ('path');
var mongoose = require ('mongoose');
var validUrl = require('valid-url');
require('dotenv').config({
  silent: true
});

var app = express();

// Setup and connect to mongoDB
var mongourl = process.env.MONGODB_URI || 'mongodb://admin:admin@ds113670.mlab.com:13670/shorturls';
mongoose.Promise = global.Promise;
mongoose.connect(mongourl);

// Get database model
var shortUrl = require('./database.js');

// Default route
app.get('/', function(req, res){
  res.sendFile(path.join(__dirname+'/index.html'));
});

// Access a shrotened URL
app.get('/:urlToForward', function(req, res){
  var urlToForward = req.params.urlToForward;
  //console.log(urlToForward);
  shortUrl.findOne({ 'shorterUrl': urlToForward }, function(err, data){
    if (err) return res.send('Error reading database');
    var reg = new RegExp("^(http||https)://","i");
    if (reg.test(data.originalUrl)){
      res.redirect(301, data.originalUrl);
    } else{
      res.redirect(301, 'http://'+data.originalUrl);
    }
  });
});

// Create a new shortened URL
app.get('/new/:urlToShorten(*)', function(req,res){
  var urlToShorten = req.params.urlToShorten;
    if (validUrl.isUri(urlToShorten)){
      var short = Math.floor(Math.random()*100000).toString();
      var data = new shortUrl (
          {
            originalUrl: urlToShorten,
            shorterUrl: short
          }
      );
      data.save(function(err){
        if (err) return res.send('Error saving to database');
      });
      return res.json(data);
    } else {
      return res.json({error: 'Invalid URL'});
    }
});

var port = process.env.PORT || 3000;
app.listen(port, function(){
  console.log('Server listening on port '+port);
});
