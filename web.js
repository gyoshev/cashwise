(function() {
  var express = require('express');
  var http = require('http');
  var path = require('path');

  var app = express();

  app.configure(function() {
    app.set('port', process.env.PORT || 3000);
    app.use(express.compress());
    app.use(express.static(__dirname + '/app'));
    app.use(express.errorHandler());
  });

  var manifest;

  var fs = require('fs');
  fs.readFile('manifest.txt', 'utf8', function (err,data) {
    if (err) {
      return console.log(err);
    }
    manifest = data + "\r\n# " + new Date();
  });

  app.get("/app.cache", function(req, res) {
    res.set('Content-Type', 'text/cache-manifest');
    res.send(200, manifest);
  });

  http.createServer(app).listen(app.get('port'), function(){
    console.log("Express server listening on port " + app.get('port'));
  });
}).call(this);
