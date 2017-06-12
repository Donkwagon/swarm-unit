// grab the things we need
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var os =              require('os');

var admin = require("firebase-admin");
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
        });

    });
}

executeQue = function(que) {
  
}

var Worker = mongoose.model('Worker', workerSchema);

module.exports = Worker;