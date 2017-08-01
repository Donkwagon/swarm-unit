
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var articleSchema = new Schema({
  articleId: { type: Number, required: true, unique: true},
  title: String,
  username: String,
  author: String,
  username: String,
  summary: Schema.Types.Mixed,
  articleUrl: String,
  includeStocks: Array,
  primaryStock: Schema.Types.Mixed,

  fitness: Number,

  authorInfo: Boolean,
  securityInfo: Boolean,

  published_at: Date,

  created_at: Date,
  updated_at: Date
});


articleSchema.methods.checkFitness = () => {

  var proceed = false;
  var expectedNumFields = 8;
  var numFields = 0;

  if(!this.title || ! this.username || ! this.author){

    this.fitness = numFields/expectedNumFields;
    return proceed;

  }else{

    this.title ? numFields++ : numFields+=0;
    this.author ? numFields++ : numFields+=0;
    this.username ? numFields++ : numFields+=0;
    this.summary ? numFields++ : numFields+=0;
    this.articleUrl ? numFields++ : numFields+=0;
    this.includeStocks ? numFields++ : numFields+=0;
    this.primaryStock ? numFields++ : numFields+=0;
    this.published_at ? numFields++ : numFields+=0;

    this.fitness = numFields/expectedNumFields;

    proceed = true;

  }

  return proceed;


  
}

var Article = mongoose.model('Article', articleSchema);

module.exports = Article;