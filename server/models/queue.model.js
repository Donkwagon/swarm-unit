// grab the things we need
var mongoose = require('mongoose');
var Schema = mongoose.Schema;


var queueSchema = new Schema({

  data: Schema.Types.Mixed,

  created_at: Date,

});

var Queue = mongoose.model('Queue', queueSchema);

module.exports = Queue;