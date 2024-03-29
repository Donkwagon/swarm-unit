var ArticleBacklog =  require('./backlog_article.model');
var Queue =           require('./queue.model');
var Seed =            require('../classes/seed.class');

var os =              require('os');

var mongoose =        require('mongoose');
var admin =           require("firebase-admin");

var Schema = mongoose.Schema;

var firebaseDb = admin.database();
var ref = firebaseDb.ref("redis");

var QueueList = [];

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

  queueList: Schema.Types.Mixed,

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

    serversQue.push().set(server);
}

supervisorSchema.methods.getUrlBacklogs = () => {

    var queueNum = 50;
    QueueList = [];

    var i = 0;
    while(i < queueNum){
        var queue = new Queue({
            data: [],
            created_at: new Date()
        });
        QueueList.push(queue);
        i++;
    }

    db.collection(CRAWLERS_COLLECTION).find({ validation: true }, function(err, crawlers) {
        if (err) {
            handleError(res, err.message, "Failed to get entrance");
        } else {
            crawlers.forEach(crawler =>{
                getCrawlerBacklogs(crawler);
            });

            setTimeout(function() {
                publishQue(QueueList);
                //this.getUrlBacklogs()
            },5000)
        }
    });

}

getCrawlerBacklogs = (crawler) => {
    var crawlerName = crawler.name;
    var min = 0; var max = 0;
    var batchIdStart = 0;
    var batchIdEnd = 0;
    var randomBatchId = 0;

    crawler.urlStrategy.sections.forEach(section => {

        if(section.type === "ID RANGE"){
            idRangeUrlCount = section.max - section.min;
            batchIdStart = Math.floor(section.min/crawler.backlogBatchSize);
            batchIdEnd = Math.round(section.max/crawler.backlogBatchSize);
            randomBatchId = Math.floor(Math.random()*(batchIdEnd - batchIdStart) +  batchIdStart);
        }

    });

    if(randomBatchId){

        db.collection(CRAWLERBACKLOGS_COLLECTION).findOne({'batchId': randomBatchId}, function(err, crawlerBacklog) {
            if (err) {
                handleError(res, err.message, "Failed to get entrance");
            } else {
                crawlerBacklog.batch.forEach(el =>{
                    var seed = new Seed(el.id,el.bId,el.bsz,crawlerName);
                    seed.queued();

                    pushToRandomQue(seed);
                });
            }
        });

    }else{

        console.log("randomBatchId undefined");

    }
}

pushToRandomQue = (seed) => {
    var len = QueueList.length;
    randomQueueIndex = Math.floor(Math.random()*len);
    QueueList[randomQueueIndex].data.push(seed);
}

publishQue = function(queue) {
    QueueList.forEach(queue => {
        console.log(queue);
        ref.child("queues").push().set(queue.toObject());
    })
}


var Supervisor = mongoose.model('Supervisor', supervisorSchema);

module.exports = Supervisor;