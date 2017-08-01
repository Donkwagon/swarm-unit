var mongoose =    require('mongoose');
var request =     require('request');
var cheerio =     require('cheerio');
var os =          require('os');
var admin =       require("firebase-admin");

const chalk =     require('chalk');

const vm =        require('vm');
var Article =     require('./content/article.model');

const CRAWLERS_COLLECTION = "crawlers"
const CRAWLERBACKLOGS_COLLECTION = "crawlerbacklogs"

var Schema = mongoose.Schema;
var firebaseDb = admin.database();
var ref = firebaseDb.ref("redis");

var crawlers = []; //hash table

var workerSchema = new Schema({

  type: String, //Supervisor and worker
  system: Schema.Types.Mixed,

  created_at: Date,
  updated_at: Date

});

workerSchema.methods.registerServer = function() {

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

workerSchema.methods.claimQue = function() {
  
    var queuesRef = ref.child("queues");

    queuesRef.orderByChild("_id").limitToFirst(1).on("value", data => {

        data.forEach(snapshot => {

            var queue = snapshot.val();
            var key = snapshot.key;
            ref.child(key).remove();

            var startTime = new Date().getTime();
            executeQue(queue,0,startTime)

        });

    });
}

executeQue = function(queue,i,startTime) {

  var max = 2000; var min = 1000;
  var intv = Math.random() * (max - min) + min;

  var seed = queue.data[i]

  matchCrawler(seed);
  
  i++;

  if(i < queue.data.length){
    //keep looping through the queue

    setTimeout(function(){

      executeQue(queue,i,startTime);
      
    }, intv);

  }else{
    //debrief once the queue is looped through

    var endTime = new Date().getTime();
    var timeConsumed = (endTime - startTime);//in miliseconds 

    debrief(queue,timeConsumed);

  }
}

matchCrawler = function(seed) {

  if(crawlers[seed.cn]){
    //check if crawler exists in the hash table

    var crawler = crawlers[seed.cn];

    crawl(crawler,seed);

  }else{

    db.collection(CRAWLERS_COLLECTION).findOne({ name: seed.cn }, function(err, crawler) {

        if (err) {

          handleError(res, err.message, "Failed to get crawler");
          
        } else {

          //store crawler info into the hashtable
          crawlers[crawler.name] = crawler;

          crawl(crawler,seed);

        }
    });

  }
}

crawl = (crawler,seed) => {

  var URL = UrlConstructor(crawler,seed);

  var req = request.defaults({jar: true,rejectUnauthorized: false,followAllRedirects: true});
  var UserAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.96 Safari/537.36';

  req.get({url: URL,headers: {'User-Agent': UserAgent}},function(err, res, html){
    
      global.$ = cheerio.load(html);
      vm.runInThisContext(crawler.code);

      //check if all fields are filled
      // title ?          console.log("success") : console.log("fail");
      // author ?         console.log("success") : console.log("fail");
      // primaryStock ?   console.log("success") : console.log("fail");
      // username ?       console.log("success") : console.log("fail");
      // articleId ?      console.log("success") : console.log("fail");
      // include_stocks ? console.log("success") : console.log("fail");
      // summary ?        console.log("success") : console.log("fail");
      // publish_at ?     console.log("success") : console.log("fail");
      
      seed.res = res.statusCode;

      var article = new Article({

        title: title,
        articleId: seed.id + seed.bId * seed.bsz,
        author: author,
        username: author,
        summary: summary,
        articleUrl: URL,
        includeStocks: include_stocks,
        primaryStock: primaryStock,
        published_at: publish_at,

        created_at: new Date(),
        updated_at: new Date()

      });
      console.log(title);
      var proceed = article.checkFitness();

      if(proceed){
        console.log(chalk.blue('trying to save'));
        article.save(function (err) {
          console.log(err);
        });
      }

      seed.st = "processing";
      seed.res = res.statusCode;
      
      if(err || res.statusCode != 200){

        seed.st = "error";
        console.log(chalk.red('err:' + err + ' | st:' + res.statusCode));

      }else{

        seed.st = "completed";
        console.log(chalk.blue('err:' + err + ' | st:' + res.statusCode));

      }
  });

}

debrief = function(queue,timeConsumed) {

  queue.status = "completed";

  var i = 0;
  var len = queue.data.length;
  var success = 0;
  var failure = 0;
  var successRate = 0;


  while(i < len){

    if(queue.data[i].st == "completed"){
      success++;
    }else{
      failure++;
    }

    i++;
  }

  successRate = success/len;
  speed = success/timeConsumed;

  queue.debrief = {
    success: success,
    failure: failure,
    sucessRate: successRate,
    timeConsumed: timeConsumed,
    speed: speed
  }

  console.log(queue.debrief);
  
  ref.child("queues").push().set(queue);

}

//utility
UrlConstructor = function(crawler,seed){
  //construct url with params in seed and url strategy in crawler

  var url = crawler.urlStrategy.root;
  var id = seed.id + seed.bId * seed.bsz; // id = batch ID * batch size + seed ID


  crawler.urlStrategy.sections.forEach(section => {
    
    if(section.type === "CONSTANT"){
        url += section.url + "/";
    }
    if(section.type === "ID RANGE"){
      url += section.prefix + id + section.suffix + "/";
    }
    if(section.type === "TICkER"){
        url += section.prefix + "AAPL" + section.suffix + "/"
    }

  });

  url = url.substring(0, url.length - 1);

  return url;

}

emitMsg = (channel,status,content) => {

  var msg = {
    status: status,
    content: content
  }
  console.log(msg);
}


var Worker = mongoose.model('Worker', workerSchema);

module.exports = Worker;