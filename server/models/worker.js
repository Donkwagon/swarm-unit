// grab the things we need
var mongoose =    require('mongoose');
var request =     require('request');
var os =          require('os');
var admin =       require("firebase-admin");
var chalk =       require('chalk');
var Parser =      require('../parsers/parser');

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
      created_at: new Date().getTime(),
      updated_at: new Date().getTime(),
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

            var que = snapshot.val();
            var key = snapshot.key;
            ref.child(key).remove();

            executeQue(que,0)

        });

    });
}

executeQue = function(que,i) {
  var startTime = new Date().getTime();
  var max = 2000;
  var min = 1000;
  var intv = Math.random() * (max - min) + min;

  crawl(que.data[i]);
  
  i++;
  if(i < que.data.length){
    setTimeout(function(){
      executeQue(que,i);
    }, intv);
  }else{
    var endTime = new Date().getTime();
    var timeConsumed = (endTime - startTime)/1000;
    debrief(que,timeConsumed);
  }
}

crawl = function(task) {
  task.st = "crawling";
  var URL = URLTransformer(task.i,task.t);
  var req = request.defaults({jar: true,rejectUnauthorized: false,followAllRedirects: true});
  var UserAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.96 Safari/537.36';

  req.get({url: URL,headers: {'User-Agent': UserAgent}},function(err, res, html){

      task.res = res.statusCode;
      task.st = "processing";

      if(err||res.statusCode != 200){
        task.st = "error";

        if(res.statusCode == 404){console.log(chalk.red('err:' + err + 'st:' + res.statusCode));}
        if(res.statusCode == 429){console.log(chalk.red('err:' + err + 'st:' + res.statusCode));}

      }else{

        console.log(chalk.green('status' + res.statusCode));
        parserSelector(task,html,URL,task.t);

      }
  });


}

debrief = function(que,timeConsumed) {

  que.status = "completed";

  var i = 0;
  var len = que.data.length;
  var success = 0;
  var failure = 0;
  var successRate = 0;

  while(i < len){

    if(que.data[i].st == "completed"){
      success++;
    }else{
      failure++;
    }

    i++;
  }

  successRate = success/len;

  que.debrief = {
    success: success,
    failure: failure,
    sucessRate: successRate,
    timeConsumed: timeConsumed
  }

}

returnCompletedQue = function(que) {

  ref.child("queues").push().set(que.toObject());

}

deccelerate = function() {}

accelerate = function() {}

URLTransformer = function(urlSeed,type){
  switch (type) {
    case "SAArticle":
      url = "https://seekingalpha.com/article/" + urlSeed;;
      return url;
  }
}

parserSelector = function(task,html,URL,type){
  parser = new Parser();
  switch (type) {
    case "SAArticle":
      data = parser.SAArticle(html,URL);
      task.st = "completed";
  }
}

var Worker = mongoose.model('Worker', workerSchema);

module.exports = Worker;