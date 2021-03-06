/**
 * Module dependencies.
 */
//Added 
var express = require('express'),
  routes = require('./routes'),
  user = require('./routes/user'),
  http = require('http'),
  redis = require('redis'),
  multer  = require('multer'),
  fs      = require('fs'),
  path = require('path');
var os = require('os');
var app = express();

var sio = require('socket.io');
var app1 = http.createServer(function (req, res) {
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end();
    })
  , io = sio.listen(app1);

var cron = require('cron');
var exec = require('child_process').exec;
  
var nodemailer = require('nodemailer');
var flag = 0;
var indicator = false;
var transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASS
    }
});

var cron = require('cron');
var cronJob = cron.job("0 */10 * * * *", function(){
    // perform operation e.g. GET request http.get() etc.
    console.info('cron job completed');
}); 
cronJob.start();
function sendAlert(flag) {

   if(flag == 1)
   message = "Memory threshold exceeded"
   else
   message = "Cpu is overloaded"

   var mailOptions = {
       from: process.env.GMAIL_USER, 
       to: process.env.GMAIL_USER, 
       subject: 'Critical', 
       text: message,
       html: '<b>Immediate action required</b>' 
       };
    transporter.sendMail(mailOptions, function(error, info){
    if(error){
              return console.log(error);
    }
    console.log('Message sent: ' + info.response);
    });  

}

function memoryLoad()
{

        var usedMem=((os.totalmem()-os.freemem())/os.totalmem());
        var usedMemPercent = (usedMem * 100).toFixed(2);
        console.log("Total % of used memory", usedMemPercent);
        return usedMemPercent;

}

function cpuLoad() {
        var load = os.loadavg();
        var oneMinuteLoad = load[0];
        var oneMinuteLoadPercent = (oneMinuteLoad % 1).toFixed(2).substring(2);        
        console.log("Total % of cpu overload", oneMinuteLoadPercent);
	      return oneMinuteLoadPercent;
}

// REDIS
var client = redis.createClient(6379, '127.0.0.1', {})

client.set("devOpsKey", "false");
app.configure(function(){
  app.set('port', process.env.PORT || 3000);
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.favicon());
  app.use(express.logger('dev'));
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(require('stylus').middleware(__dirname + '/public'));
  app.use(express.static(path.join(__dirname, 'public')));
});

app.configure('development', function(){
  app.use(express.errorHandler());
});

app.get('/', function(req, res){
  res.render('index', {
    title: 'Home'
  });
});


app.get('/about', function(req, res){

  client.get("devOpsKey", function(err,value){ 
    if (err) throw err
    console.log("listening at port 3000 ");
    console.log("Value of the key is ", value);
    //console.log(value);
    //res.send(value);
    if(value=="true"){
       res.render('aboutFeature', {
        title: 'AboutFeature'
      });
     }else{
        res.render('about', {
        title: 'About'
      });
     }
  });

 
});

app.get('/contact', function(req, res){
  res.render('contact', {
    title: 'Contact'
  });
});

http.createServer(app).listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});

var client1 = redis.createClient(6379, '107.170.71.146', {});
function execute(command, callback){
    exec(command, function(error, stdout, stderr){ callback(stdout); });
}

setInterval( function () 
{
  var memLoadPercent = memoryLoad();
  var cpuLoadPercent = cpuLoad();
  
  var memL = parseFloat(memLoadPercent);
  var cpuL = parseFloat(cpuLoadPercent);
  
  if(cpuL > 90) {
    flag = 0;
    sendAlert(flag);
    indicator = true;
  }
  if(memL > 65) {
    flag = 1;
    sendAlert(flag);
    indicator = true;
    exec('./backup.sh',
          function (error, stdout, stderr) {
               console.log('stdout: ' + stdout);
               console.log('stderr: ' + stderr);
               if (error !== null) {
                   console.log('exec error: ' + error);
               }
           console.log("Setting the key in redis server");
           client1.set("SwitchKey","true");
           execute('shutdown -r now', function(callback){
                 console.log(callback);
          });

    });

   
  }
  
  io.sockets.emit('heartbeat', 
	{ 
        status: indicator
   });

}, 2000);

app1.listen(3001);

