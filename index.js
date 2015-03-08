"use strict";

// external libs
var express = require("express");
var bodyParser = require('body-parser');
var morgan = require("morgan");
var q = require("q");

// app setup
var app = express();
app.use(morgan("combined"));
app.use(bodyParser.json());

// internal libs
var config = require("./config.js");
var asapi = require("./api/asapi.js");
var AsapiController = require("./controllers/asapi-controller.js");
var controller = new AsapiController(asapi);
asapi.setRoutes(app, controller.requestHandler);

module.exports.registerServices = function(serviceConfigs) {
    for (var i=0; i<serviceConfigs.length; i++) {
        srvConfig = serviceConfigs[i];
        srvConfig.service.register(controller);
        // TODO handle hs port token, controller per service?
    }
};

module.exports.runForever = function() {
    // TODO store HS token somewhere to prevent re-register on every startup.
    controller.register(config.homeServerUrl, config.applicationServiceUrl, 
                              config.applicationServiceToken).then(
                              function(hsToken) {
        console.log("Registered with token %s", hsToken);
        var server = app.listen(config.port || 3000, function() {
            var host = server.address().address;
            var port = server.address().port;
            console.log("Listening at %s on port %s", host, port);
        });
    },
    function(err) {
        console.error("Unable to register for token: %s", JSON.stringify(err));
    });
};

