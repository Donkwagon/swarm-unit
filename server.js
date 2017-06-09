var express =         require("express");
var bodyParser =      require("body-parser");
var mongoose =        require('mongoose');
var http =            require('http');
var admin =           require("firebase-admin");
var chalk =           require('chalk');

var os =              require('os');

var conStr = "mongodb://Donkw:Idhap007@ds115532-a0.mlab.com:15532,ds115532-a1.mlab.com:15532/heroku_tln16g2j?replicaSet=rs-ds115532;"

///////////////////////////////////////////////////////
var serviceAccount =  require("./server/firebase/redis-5d64d-firebase-adminsdk-i86pn-f7b456002c.json");
var admin = require("firebase-admin");
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://redis-5d64d.firebaseio.com"
});

var app = express();
app.use(bodyParser.json());

var distDir = __dirname + "/dist/";
app.use(express.static(distDir));

const server = http.createServer(app);

server.listen(8200, function (err) {
  if (err) {console.log(err);process.exit(1);}
  var port = server.address().port;
  console.log(chalk.cyan("App now running on port", port));
});

global.db = (global.db ? global.db : mongoose.createConnection(conStr));
mongoose.connect(conStr);


var main =  require('./server/main');
setTimeout(function(){main();}, 5000);




console.log("Host");
console.log(os.hostname());
console.log("Type");
console.log(os.type());
console.log("Platform");
console.log(os.platform());
console.log("Architecture");
console.log(os.arch());
console.log("Release");
console.log(os.release());
console.log("Uptime");
console.log(os.uptime());
console.log("Load Average");
console.log(os.loadavg());
console.log("Total Memory");
console.log(os.totalmem()/1024/1024 + "MB");
console.log("Free Memeory");
console.log(os.freemem()/1024/1024 + "MB");
console.log("CPUs");
console.log(os.cpus());
console.log("Network Interfaces");
console.log(os.networkInterfaces());