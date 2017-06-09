// grab the things we need
var mongoose = require('mongoose');
var Schema = mongoose.Schema;


var workerSchema = new Schema({

  type: String, //Supervisor and worker
  system: Schema.Types.Mixed,

  created_at: Date,
  updated_at: Date

});


var Worker = mongoose.model('Worker', workerSchema);

module.exports = Worker;