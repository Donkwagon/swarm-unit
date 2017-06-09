// grab the things we need
var mongoose = require('mongoose');
var Schema = mongoose.Schema;


var queueSchema = new Schema({

  type: String, //Supervisor and worker
  system: Schema.Types.Mixed,
  data: Schema.Types.Mixed,

  created_at: Date,
  updated_at: Date

});

queueSchema.methods.setSupervisor = () => {
    this.type = "supervisor";
    this.created_at = new Date();
    this.updated_at = new Date();
    this.save();
};

queueSchema.methods.setWorker = () => {
    this.type = "worker";
    this.created_at = new Date();
    this.updated_at = new Date();
    this.save();
};

var Queue = mongoose.model('Queue', queueSchema);

module.exports = Queue;