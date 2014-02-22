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

  // cache manifest
  var c = require('appcache-node');
  var cf = c.newCache([
    "http://code.jquery.com/jquery-1.9.1.min.js",
    "http://cdn.kendostatic.com/2013.3.1324/js/kendo.mobile.min.js",
    "http://cdn.kendostatic.com/2013.3.1324/styles/kendo.mobile.all.min.css",
    "http://cdn.kendostatic.com/2013.3.1324/styles/images/kendoui.woff",
    "localforage.min.js",
    "model.js",
    "styles.css"
  ]);

  app.get("/app.cache", function(req, res) {
    res.set('Content-Type', 'text/cache-manifest');
    res.send(200, cf);
  });

  http.createServer(app).listen(app.get('port'), function(){
    console.log("Express server listening on port " + app.get('port'));
  });
}).call(this);
