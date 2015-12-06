var express = require('express')
var app = express()
var http = require('http')
var httpProxy = require('http-proxy')
var sioc = require('socket.io-client');
var indicator = false;
var redis = require('redis');
var proxy = httpProxy.createProxyServer({});
var count = 1;

var prod = process.argv[2];
var canary = process.argv[3];
var switchValue = false;
var socket = sioc('http://'+canary+':3003');
var client = redis.createClient(6379, '127.0.0.1', {})
socket.on("heartbeat", function(client) {
    indicator = client.status;
    //console.log("Status is "+indicator);
    if(indicator==true) {
       //console.log("Canary Server Failed.");
    }
});
//console.log("Came here");
//switchValue = client.get("SwitchKey");  
//PROXY SERVER

//console.log(client.get("Switch"));
var server = http.createServer(function(req, res) {
  if(count==10)
switchValue = true;

        if(switchValue==false) {
          var target = "http://" + prod + ":3000";
          proxy.web(req, res, {target: target});
          console.log("Request forwarded to original instance");
          count ++;
                }
else {
            target = "http://" + canary + ":3002";
            proxy.web(req, res, {target: target});
            console.log("Request forwarded to backup instance");

                }
});
console.log("Proxy server listening on port 4000");
server.listen(4000);
