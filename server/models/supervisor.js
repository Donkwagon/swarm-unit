// grab the things we need
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ArticleBacklog = require('./backlog_article.model');
var Queue = require('./queue.model');


var admin = require("firebase-admin");
var firebaseDb = admin.database();
var ref = firebaseDb.ref("redis");

const ARTICLE_BACKLOGS_COLLECTION = "articlbacklogs"

var supervisorSchema = new Schema({

  type: String, //Supervisor and worker
  system: Schema.Types.Mixed,

  created_at: Date,
  updated_at: Date

});

supervisorSchema.methods.getUrlBacklogs = () => {
    var upperBound = 2600706;
    var lowerBound = 4000004;
    var poolSize = 500;
    var queSize = 100;

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
                    console.log(dice);
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

publishQue = function(queueData) {
    console.log(JSON.stringify(queueData));
    var queue = new Queue({
        data: queueData,
        created_at: new Date(),
        updated_at: new Date()
    })

    var queuesRef = ref.child("queues");
    console.log(queue);

    // we can also chain the two calls together
    queuesRef.push().set(queue.toObject());
}

var Supervisor = mongoose.model('Supervisor', supervisorSchema);

module.exports = Supervisor;