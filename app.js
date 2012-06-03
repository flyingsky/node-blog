/**
 * Module dependencies.
 */

var express = require('express');
var ArticleProvider = require('./articleprovider-mongodb').ArticleProvider;
var markdown = require('markdown-js');


var app = module.exports = express.createServer();

// Configuration

app.configure(function(){
    app.set('views', __dirname + '/views');
    app.set('view engine', 'jade');
    app.set('view option', {layout: false});
    app.use(express.bodyParser());
    app.use(express.methodOverride());
    app.use(require('stylus').middleware({ src: __dirname + '/public' }));
    app.use(app.router);
    app.use(express.static(__dirname + '/public'));
});

app.configure('development', function(){
    app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});

app.configure('production', function(){
    app.use(express.errorHandler());
});

var articleProvider = new ArticleProvider();
// Routes

app.get('/', function(req, res){
    articleProvider.findAll( function(error,docs){
        var articles = docs || [];
        articles.forEach(function(article, index){
            article.body = markdown.makeHtml(article.body);
        });
        res.render('index.jade', {
            locals: {
                title: 'Blog',
                articles: articles
            }
        });
    })
});

//new post
app.get('/blog/upsert', function(req, res) {
    res.render('blog_new.jade', {
        locals: {
            title: 'New Post',
            article: {
                id: '',
                title: '',
                body: ''
            }
        }
    });
});

//update post
app.get('/blog/upsert/:id', function(req, res) {
    articleProvider.findById(req.params.id, function(error, article) {
        console.log(article);
        res.render('blog_new.jade', {
            locals: {
                title: article.title,
                article:article
            }
        });
    });
});

//create or update post
app.post('/blog/upsert', function(req, res){
    var id = req.param('id');
    if (id) {
        var article = {
            _id: id,
            title: req.param('title'),
            body: req.param('body')
        };
        console.log('before update article');
        console.log(article);
        articleProvider.update(article, function(error, article) {
            res.redirect('/blog/' + article._id);
        });
    } else {
        articleProvider.save({
            title: req.param('title'),
            body: req.param('body')
        }, function( error, docs) {
            res.redirect('/')
        });
    }
});

function _showArticle(res, article) {
    article.body = markdown.makeHtml(article.body);
    res.render('blog_show.jade',{
        locals: {
            title: article.title,
            article: article
        }
    });
}

app.get('/blog/:id', function(req, res) {
    articleProvider.findById(req.params.id, function(error, article) {
        _showArticle(res, article);
    });
});

app.get('/blog/delete/:id', function(req, res) {
    articleProvider.removeById(req.params.id, function(error, article) {
        if(!error){
            res.redirect('/');
        }
    });
});

app.post('/blog/addComment', function(req, res) {
    articleProvider.addCommentToArticle(req.param('_id'), {
        person: req.param('person'),
        comment: req.param('comment'),
        created_at: new Date()
    } , function( error, docs) {
        res.redirect('/blog/' + req.param('_id'))
    });
});

app.register('.md', {
    compile: function(str, options){
        var html = markdown.makeHtml(str);
        return function(locals){
            return html.replace(/\{([^}]+)\}/g, function(_, name){
                return locals[name];
            });
        };
    }
});

app.get('/s', function(req, res){
    res.render('hello/hello.md', {layout: false});
});

app.listen(process.env.VCAP_APP_PORT || 3000);
console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);