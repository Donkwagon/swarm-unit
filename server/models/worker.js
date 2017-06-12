// grab the things we need
var mongoose =    require('mongoose');
var request =     require('request');
var cheerio =     require('cheerio');
var os =          require('os');
var admin =       require("firebase-admin");
var chalk =       require('chalk');
var parser =       require('../parsers/parser');

var Schema = mongoose.Schema;
var firebaseDb = admin.database();
var ref = firebaseDb.ref("redis");

var workerSchema = new Schema({

  type: String, //Supervisor and worker
  system: Schema.Types.Mixed,

  created_at: Date,
  updated_at: Date

});

workerSchema.methods.registerServer = () => {

    var serversQue = ref.child("servers");
    var server = {
        type: "worker",
        created_at: new Date(),
        updated_at: new Date(),
        system:{
            host: os.hostname(),
            type: os.type(),
            platform: os.platform(),
            loadAvg: os.loadavg(),
            totalMem: os.totalmem(),
            freeMem: os.freemem(),
            networkInterfaces: os.networkInterfaces()
        }
    }

    serversQue.push().set(server);
}

workerSchema.methods.claimQue = () => {
  
    var queuesRef = ref.child("queues");

    queuesRef.orderByChild("_id").limitToFirst(1).on("value", data => {

        data.forEach(snapshot => {
            let que = snapshot.val();
            let key = snapshot.key;
            ref.child(key).remove();

            executeQue(que,0)
        });

    });
}

executeQue = function(que,i) {

  let max = 3000;
  let min = 1000;
  let intv = Math.random() * (max - min) + min;

  task = que.data[i];
  crawl(task);
  i++;
  if(i < que.data.length){
    setTimeout(function(){
      executeQue(que,i);
    }, intv);
  }else{
    debrief(que);
  }
}

crawl = function(task) {
  let URL = "https://seekingalpha.com/article/" + task.i;
  console.log(URL);
  let req = request.defaults({jar: true,rejectUnauthorized: false,followAllRedirects: true});
  let UserAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.96 Safari/537.36';

  req.get({url: URL,headers: {'User-Agent': UserAgent}},(err, res, html) =>{

      if(err||res.statusCode != 200){
        if(res.statusCode == 400){
          console.log(chalk.red('error:' + error + 'status:' + res.statusCode));
        }
        if(res.statusCode == 429){

        }

      }else{

          console.log(chalk.green('status' + res.statusCode));
          parser.SAArticle(html,URL);

      }
  });
}

debrief = function(que) {
  console.log("");
}

deccelerate = function() {
}

accelerate = function() {
}

var Worker = mongoose.model('Worker', workerSchema);

module.exports = Worker;