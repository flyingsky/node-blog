/**
 * Created with IntelliJ IDEA.
 * User: ramon
 * Date: 6/14/12
 * Time: 6:14 PM
 * To change this template use File | Settings | File Templates.
 */

var ArticleProvider = require('../articleprovider-mongodb').ArticleProvider;
var articleDb = new ArticleProvider();

exports.autoSaveArticle = function(req, res) {

    var id = req.param('id');
    var article = {
        body: req.param('body'),
        title: req.param('title')
    };

    var callback = function(err, articles) {
        res.contentType('application/json');
        var article = articles;
        if (typeof(articles.length) !== "undefined") {
            article = articles[0];
        }

        if (article) {
            res.send(article);
        } else {
            res.send({error: 'Error, no article'});
        }
    };

    if (!id) {
        articleDb.save(article, callback);
    } else {
        article._id = id;
        articleDb.update(article, callback);
    }
};