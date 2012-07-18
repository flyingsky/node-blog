/**
 * Module dependencies.
 */

var express = require('express');
var ArticleProvider = require('./articleprovider-mongodb').ArticleProvider;
var markdown = require('markdown-js');
var config = require('./config.js');
var util = require('./lib/util');
var articleWS = require('./routes/articleService');


var app = module.exports = express.createServer();

// Configuration

app.configure(function(){
    app.set('views', __dirname + '/views');
    app.set('view engine', 'jade');
    app.set('view option', {layout: false});
    app.use(express.bodyParser({
        uploadDir: __dirname + '/tmp',
        keepExtensions: true
    }));
    app.use(express.cookieParser());
    app.use(express.session({ secret: "ramonblog" }));
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

var articleProvider = new ArticleProvider();
// Routes

function _extLocals(locals, req) {
    var extraLocals = {
        readOnly: _isReadOnly(req),
        favLinks: config.favLinks,
        categories: config.categories,
        cid: null
    }
    return util.extend(extraLocals, locals);
}

function _isReadOnly(req) {
    return !(req && req.session && req.session.isManager);
}

function _generatePage(count, currentPage) {
    var pageSize = config.homeConfig.pageSize;
    var displayPageCount = config.homeConfig.displayPageCount;
    var reminder = count % pageSize;
    var totalPage = (count - reminder) / pageSize;
    if (reminder != 0) {
        totalPage += 1;
    }

    var pageObj = {
        displayPages: [],
        currentPage: currentPage,
        less: null,
        more: null
    };
    pageObj.first = currentPage == 0 ? -1 : 0;
    pageObj.previous = currentPage > 0 ? currentPage - 1 : -1;
    pageObj.next = currentPage < totalPage - 1 ? currentPage + 1 : -1;
    pageObj.last = currentPage < totalPage - 1 ? totalPage - 1 : -1;

    reminder = currentPage % displayPageCount;
    for(var i = 0, displayPageIndex = currentPage - reminder; i < displayPageCount && displayPageIndex < totalPage; i++, displayPageIndex++) {
        pageObj.displayPages.push(displayPageIndex);
    }

    if (pageObj.displayPages.length > 0 && pageObj.displayPages[0] >= displayPageCount) {
        pageObj.less = pageObj.displayPages[0] - pageSize;
    }
    if (pageObj.displayPages.length > 0 && pageObj.displayPages[0] + displayPageCount < totalPage) {
        pageObj.more = pageObj.displayPages[0] + pageSize;
    }

    console.log(pageObj);
    return pageObj;
}

app.get('/', function(req, res){
    var page = req.param('page') || 0;  //first page is 0
    if (typeof page != 'number') {
        page = parseInt(page);
    }

    var pageSize = config.homeConfig.pageSize;
    var cid = req.param('cid') === null || req.param('cid') === undefined ? 0 : req.param('cid');
    cid = parseInt(cid);
    req.session.cid = cid;
    var query = cid == 0 ? {} : {cid: cid};

    articleProvider.findAll(query, {
        limit: pageSize,
        skip: page * pageSize,
        sort: [['created_at', 'desc']]
    }, function(error,docs){
        var articles = docs || [];
        articles.forEach(function(article, index){
            article.body = markdown.makeHtml(article.body);
        });
        articleProvider.count(query, function(err, count){
            res.render('index.jade', {
                locals: _extLocals({
                    title: 'Blog',
                    articles: articles,
                    pageObj: _generatePage(count, page),
                    cid: cid
                }, req)
            });
        });
    })
});

app.get('/login', function(req, res){
    if (_isReadOnly(req)) {
        res.render('login.jade', {
            locals: _extLocals({
                errorMsg: req.session.errorMsg
            }, req)
        });
    } else {
        res.redirect('/');
    }

});

app.post('/login', function(req, res){
    var name = req.param('name');
    var password = req.param('password');
    console.log(name + '; ' + password);
    if (name == config.name && password == config.password)
    {
        req.session.isManager = true;
        console.log('login success');
        res.redirect('/');
    }
    else
    {
        req.session.errorMsg = 'user name or password is wrong';
        res.redirect('/login');
    }
});

/*
app.post('/', function(req, res){
    var events = req.param('events');
    console.log(events);
    res.redirect('/');
});
*/

//new post
app.get('/blog/upsert', function(req, res) {
    res.render('blog_new.jade', {
        locals: _extLocals({
            title: 'New Post',
            article: {
                id: '',
                cid: req.session.cid,
                title: '',
                body: ''
            }
        })
    });
});

//update post
app.get('/blog/upsert/:id', function(req, res) {
    articleProvider.findById(req.params.id, function(error, article) {
        console.log(article);
        res.render('blog_new.jade', {
            locals: _extLocals({
                title: article.title,
                article:article
            })
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
            body: req.param('body'),
            cid: req.param('cid')
        };
        console.log('before update article');
        console.log(article);
        articleProvider.update(article, function(error, article) {
            res.redirect('/blog/' + article._id);
        });
    } else {
        articleProvider.save({
            title: req.param('title'),
            body: req.param('body'),
            cid: req.param('cid')
        }, function( error, docs) {
            res.redirect('/?cid=' + req.session.cid);
        });
    }
});

app.get('/blog/:id', function(req, res) {
    articleProvider.findById(req.params.id, function(error, article) {
        article.body = markdown.makeHtml(article.body);
        res.render('blog_show.jade',{
            locals: _extLocals({
                title: article.title,
                article: article
            }, req)
        });
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

app.get('/about', function(req, res){
    res.render('about.jade', {locals: _extLocals({cid: -1}, req)});
});

app.all('/s/article/:service', function(req, res){
    var service = req.params.service;
    console.log(service);
    if (articleWS[service]) {
        articleWS[service](req, res);
    } else {
        //TODO: handle not found error
        console.log('Not Found');
    }
});

var demoActions = require('./routes/demo');

app.all('/demos/:action', function(req, res){
    var action = req.params.action;
    console.log("demo action: " + action);
    if (demoActions[action]) {
        demoActions[action](req, res);
    } else {
        //TODO: handle not found error
        res.render('demos/' + action + '.jade', {locals:{}});
    }
});

app.listen(process.env.VCAP_APP_PORT || 3000);
console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);