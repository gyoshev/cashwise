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

  http.createServer(app).listen(app.get('port'), function(){
    console.log("Express server listening on port " + app.get('port'));
  });
}).call(this);