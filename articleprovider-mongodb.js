var util = require('./lib/util');
var Db = require('mongodb').Db;
var Connection = require('mongodb').Connection;
var Server = require('mongodb').Server;
var BSON = require('mongodb').BSON;
var ObjectID = require('mongodb').ObjectID;

var dbenv;

function setupDBEnv() {

}

ArticleProvider = function() {
    var self = this;

    if(process.env.VCAP_SERVICES){
        var env = JSON.parse(process.env.VCAP_SERVICES);
        dbenv = env['mongodb-1.8'][0]['credentials'];
    }
    else{
        dbenv = {
            "hostname": "localhost",
            "port": 27017,
            "db": "node-mongo-blog"
        }
    }

    var dburl = null;

    if(dbenv.username && dbenv.password){
        dburl = "mongodb://" + dbenv.username + ":" + dbenv.password + "@" + dbenv.hostname + ":" + dbenv.port + "/" + dbenv.db;
    }else{
        dburl = "mongodb://" + dbenv.hostname + ":" + dbenv.port + "/" + dbenv.db;
    }

    require('mongodb').connect(dburl, function(err, db){
        self.db = db;
    });
};


ArticleProvider.prototype.getCollection= function(callback) {
    this.db.collection('articles', function(error, article_collection) {
        if( error ) callback(error);
        else callback(null, article_collection);
    });
};

ArticleProvider.prototype.findAll = function(query, options, callback) {
    if (typeof options === 'function') {
        callback = options;
    }
    options = util.extend({}, options);
    query = util.extend({}, query);

    this.getCollection(function(error, article_collection) {
        if( error ) callback(error)
        else {
            article_collection.find(query, options).toArray(function(error, results) {
                console.log("findAll results=" + results.length);
                if( error ) callback(error)
                else callback(null, results)
            });
        }
    });
};

ArticleProvider.prototype.count = function(query, callback) {
    if (typeof query === 'function') {
        callback = query;
        query = {};
    }

    this.getCollection(function(err, collection){
        collection.count(query, callback);
    });
};


ArticleProvider.prototype.findById = function(id, callback) {
    this.getCollection(function(error, article_collection) {
        if( error ) callback(error)
        else {
            article_collection.findOne({_id: article_collection.db.bson_serializer.ObjectID.createFromHexString(id)}, function(error, result) {
                if( error ) callback(error)
                else callback(null, result)
            });
        }
    });
};

ArticleProvider.prototype.removeById = function(id, callback) {
    this.getCollection(function(error, collection){
        collection.remove({_id: collection.db.bson_serializer.ObjectID.createFromHexString(id)}, function(error){
            callback(error);
        });
    });
};

function _validate(article) {
    if (article.cid) {
        if (typeof(article.cid) != 'number') {
            article.cid = parseInt(article.cid);
            if (isNaN(article.cid)) {
                article.cid = 0;
            }
        }
    } else {
        article.cid = 0;
    }
    return article;
}

ArticleProvider.prototype.save = function(articles, callback) {
    this.getCollection(function(error, article_collection) {
        if( error ) callback(error)
        else {
            if( typeof(articles.length)=="undefined")
                articles = [articles];

            for( var i =0;i< articles.length;i++ ) {
                article = articles[i];
                _validate(article);
                article.created_at = new Date();
                if( article.comments === undefined ) article.comments = [];
                for(var j =0;j< article.comments.length; j++) {
                    article.comments[j].created_at = new Date();
                }
            }

            article_collection.insert(articles, function() {
                callback(null, articles);
            });
        }
    });
};

ArticleProvider.prototype.update = function(article, callback) {
    this.getCollection(function(error, article_collection){
        if (error) {
            callback(error);
        }
        else {
            article_collection.update({
                _id: article_collection.db.bson_serializer.ObjectID.createFromHexString(article._id)
            }, {
                $set: {
                    title: article.title,
                    body: article.body,
                    cid: _validate(article).cid
                }
            }, {
                safe: true
            }, function(){
                callback(null, article);
            });
        }
    });
};

ArticleProvider.prototype.addCommentToArticle = function(articleId, comment, callback) {
    this.getCollection(function(error, article_collection) {
        if( error ) callback( error );
        else {
            article_collection.update(
                {_id: article_collection.db.bson_serializer.ObjectID.createFromHexString(articleId)},
                {"$push": {comments: comment}},
                function(error, article){
                    if( error ) callback(error);
                    else callback(null, article)
                });
        }
    });
};

exports.ArticleProvider = ArticleProvider;