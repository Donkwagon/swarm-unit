const express =   require('express');
var app =         express();

var Role =        require('./models/role');
var Supervisor =  require('./models/supervisor');
var Worker =      require('./models/worker');

var admin = require("firebase-admin");
var firebaseDb = admin.database();
var ref = firebaseDb.ref("redis");



function Parser() {
}

Parser.prototype.SAArticle = function(html,URL) {

    //page parsing logic
    //takes html and return desired data

    var $ = cheerio.load(html);

    /////////////////////////////////////////////////////////////////////////////////
    //Data values of interest
    var title = $('h1','.sa-art-hd ').text();
    var author = $('span','.name-link').text();
    var primaryStock = null;
    var username = null;
    var articleId = null;
    
    var include_stocks = [];
    var summary = [];
    var publish_at = $('time').attr('content');

    if($('.name-link').attr("href")){
        temp = $('.name-link').attr("href").split('/');
        len = temp.length;
        username = temp[len - 2];
    }

    if(URL.split('article/')[1]){
        var articleId = URL.split('article/')[1].split('-')[0];
    }
    
    $('meta').each(function(i, el) {
        //asssuming the first two key words in this meta tag is always ticker and security name for article page
        if($(this).attr('name') == 'news_keywords'){
            primaryStock = {
                symbol:$(this).attr('content').split(', ')[0],
                securityName:$(this).attr('content').split(', ')[1]
            };  
        }
    });
    
    $('p','.article-summary').each(function(i, el) {
        var text = $(this).text();
        summary.push(text);
    });

    if($('a','#about_stocks')){
        $('a','#about_stocks').each(function(i, el) {
            var includedStock = {
                symbol: $(this).text(),
                securityName : $(this).attr('title'),
            }
            include_stocks.push(includedStock);
        });
    };

    var article = new Article({
        articleId: articleId,
        title: title,
        author: author,
        username: username,
        summary: summary,
        articleUrl: URL,
        includeStocks: include_stocks,
        primaryStock:primaryStock,

        published_at: publish_at,
        created_at: new Date()
    });
    
    return article;
};

Parser.prototype.SAStockTalk = function(html) {
    
};

Parser.prototype.STTwit = function(html) {
    
};


module.exports = Parser;