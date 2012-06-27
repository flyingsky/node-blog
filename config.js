/**
 * Created with IntelliJ IDEA.
 * User: ramon
 * Date: 6/9/12
 * Time: 12:04 AM
 * To change this template use File | Settings | File Templates.
 */
var config = {
    name: 'test',
    password: 'test',
    homeConfig: {
        pageSize: 10,
        displayPageCount: 10
    },
    categories: [{
        title: 'Home',
        cid: 0
    },{
        title: 'Collection',
        cid: 2
    }, {
        title: 'Demo',
        cid: 3
    }, {
        title: 'Thought',
        cid: 4
    }],
    favLinks: [{
        title: 'My old blog',
        url:'http://blog.csdn.net/llmlx',
        description: 'My old blog at CSDN'
    }, {
        title: 'Node.JS MongoDB Driver',
        url: 'http://mongodb.github.com/node-mongodb-native/index.html',
        description: 'The Node.JS MongoDB Driver Manual'
    }, {
        title: 'Markdown',
        url: 'http://daringfireball.net/projects/markdown/dingus',
        description: 'Markdown online editor'
    }, {
        title: 'NodeJS',
        url: 'http://nodejs.org/api/',
        description: 'NodeJs Manual and Documentation'
    }, {
        title: 'Express Framework',
        url: 'http://expressjs.com/',
        description: 'The most popular web framework for NodeJS'
    }, {
        title: 'Cloud Foundry',
        url: 'http://www.cloudfoundry.com/',
        description: 'Open source Platform as a Service, which hosted this blog'
    }, {
        title: 'Source Repository on GitHub',
        url: 'https://github.com/flyingsky',
        description: 'This blog source code repository on GitHub'
    }, {
        title: 'Node Cloud',
        url: 'http://www.nodecloud.org/',
        description: 'A resource directory gathering sites related to Node.js and ordering them by their Alexa traffic'
    },{
        title: 'Echo JS',
        url: 'http://www.echojs.com/',
        description: 'A social news site dedicated to JavaScript and related topics'
    }, {
        title: 'Color Schema Designer',
        url: 'http://colorschemedesigner.com/',
        description: 'A cool online color schema designer'
    }]
};

module.exports = config;