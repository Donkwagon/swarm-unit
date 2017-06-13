
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

  authorInfo: Boolean,
  securityInfo: Boolean,

  published_at: Date,

  created_at: Date,
  updated_at: Date
});



var Article = mongoose.model('Article', articleSchema);

module.exports = Article;