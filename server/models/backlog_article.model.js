
var mongoose =    require('mongoose');
var Schema = mongoose.Schema;

var ArticleBacklogSchema = new Schema({

    i: Number,
    st: String,
    res: Number
    
});


var ArticlBacklog = mongoose.model('ArticlBacklog', ArticleBacklogSchema);

module.exports = ArticlBacklog;