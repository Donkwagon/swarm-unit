// grab the things we need
var mongoose = require('mongoose');
var Schema = mongoose.Schema;


var roleSchema = new Schema({

  type: String, //Supervisor and worker
  system: Schema.Types.Mixed,

  created_at: Date,
  updated_at: Date

});

roleSchema.methods.setSupervisor = () => {
    this.type = "supervisor";
    this.created_at = new Date();
    this.updated_at = new Date();
    this.save();
};

roleSchema.methods.setWorker = () => {
    this.type = "worker";
    this.created_at = new Date();
    this.updated_at = new Date();
    this.save();
};

var Role = mongoose.model('Role', roleSchema);

module.exports = Role;