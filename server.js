var express =         require("express");
var bodyParser =      require("body-parser");
var mongoose =        require('mongoose');
var http =            require('http');
var admin =           require("firebase-admin");
var chalk =           require('chalk');

var os =              require('os');

var conStr = "mongodb://Donkw:Idhap007@ds115532-a0.mlab.com:15532,ds115532-a1.mlab.com:15532/heroku_tln16g2j?replicaSet=rs-ds115532;"

///////////////////////////////////////////////////////
var serviceAccount =  require("./server/firebase/swarm-c0b98-firebase-adminsdk-q66u1-685dfe1150");
var admin = require("firebase-admin");
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://swarm-c0b98.firebaseio.com"
});

var app = express();
app.use(bodyParser.json());

var distDir = __dirname + "/dist/";
app.use(express.static(distDir));

const server = http.createServer(app);

server.listen(process.env.PORT || 8100, function (err) {
  if (err) {console.log(err);process.exit(1);}
  var port = server.address().port;
  console.log(chalk.cyan("App now running on port", port));
});

global.db = (global.db ? global.db : mongoose.createConnection(conStr));
mongoose.connect(conStr);


var main =  require('./server/main');
setTimeout(function(){main();}, 5000);

