// grab the things we need
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ArticleBacklog = require('./backlog_article.model');
var Queue = require('./queue.model');
var os =              require('os');


var admin = require("firebase-admin");
var firebaseDb = admin.database();
var ref = firebaseDb.ref("redis");

const ARTICLE_BACKLOGS_COLLECTION = "articlbacklogs"
const CRAWLERS_COLLECTION = "crawlers"
const CRAWLERBACKLOGS_COLLECTION = "crawlerbacklogs"

// Generic error handler used by all endpoints.
function handleError(res, reason, message, code) {
  console.log("ERROR: " + reason);
  res.status(code || 500).json({"error": message});
}

var supervisorSchema = new Schema({

  type: String, //Supervisor and worker
  system: Schema.Types.Mixed,

  created_at: Date,
  updated_at: Date

});

supervisorSchema.methods.registerServer = () => {
    
    var serversQue = ref.child("servers");
    var server = {
        type: "supervisor",
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

    console.log(server);

    serversQue.push().set(server);
}

supervisorSchema.methods.getUrlBacklogs = () => {
    var upperBound = 2600706;
    var lowerBound = 4000004;
    var poolSize = 500;
    var queSize = 100;

    //get lots of urls and generate n ques

    //get validated crawler first

    
    db.collection(ENTRANCE_COLLECTION).find({ validation: true }, function(err, crawlers) {
        if (err) {
            handleError(res, err.message, "Failed to get entrance");
        } else {
            console.log(crawlers);
            
            crawlers.forEach(crawler =>{
                getCrawlerBacklogs(crawler);
            });
        }
    });

    getBatchUrls(upperBound,lowerBound,poolSize,queSize);
}

getBatchUrls = function(upperBound,lowerBound,poolSize,queSize){

    var max = 0;
    var min = 0;
    max = Math.random()*(upperBound - lowerBound) +  lowerBound;
    max = parseInt(max);
    min = max - poolSize;

    var que = [];
    var len = 0;
    
    ArticleBacklog.find({ st: null }).where('i').gt(min).lt(max).exec((err, docs) => {
        
        if (err) {
            handleError(res, err.message, "Failed to get authors.");
        } else {
            var i = 0;
            while(i < docs.length){
                if(len == queSize){
                    publishQue(que);
                    break;
                }else{
                    var dice = parseInt(Math.random()*(7 - 1) +  1);
                    if(dice == 6){
                        docs[i].st = "inqueue";
                        docs[i].save();
                        que.push(docs[i].toObject());
                        len++;
                        i++;
                    };
                }
            }
        }
    });

}

getCrawlerBacklogs = (crawler) => {
    var crawlerName = crawler.name;
    var min = 0;
    var max = 0;
    var batchIdStart = 0;
    var batchIdEnd = 0;

    crawler.urlStrategy.sections.forEach(section => {

        if(section.type == "ID RANGE"){
            idRangeUrlCount = section.max - section.min;
            batchIdStart = Math.floor(section.min/crawler.backlogBatchSize);
            batchIdEnd = Math.round(section.max/crawler.backlogBatchSize);
        }

    });

    //pick random batchId
    var randomBatchId = Math.random()*(batchIdEnd - batchIdStart) +  batchIdStart;

    
    // db.collection(CRAWLERBACKLOGS_COLLECTION).find({ batchId: randomBatchId }, function(err, crawlerBacklog) {
    //     if (err) {
    //         handleError(res, err.message, "Failed to get entrance");
    //     } else {
    //         console.log(batch);
            
    //         var seed = [i,false,0,null,false];///[id, request, num of attempts, response code, success(saved)]
            
    //         crawlerBacklog.batch.forEach(seed =>{
    //             getCrawlerBacklogs(crawler);
    //         });
    //     }
    // });
}

publishQue = function(queueData) {
    
    var queue = new Queue({
        data: queueData,
        created_at: new Date(),
        updated_at: new Date()
    })

    ref.child("queues").push().set(queue.toObject());
}



var Supervisor = mongoose.model('Supervisor', supervisorSchema);

module.exports = Supervisor;