'use strict';

var hapi = require('hapi'),
    fileLoader = require('./lib/fileLoader.js'),
    pageRenderer = require('./lib/pageRenderer.js'),
    server = new hapi.Server(),
    config = require('./config.js');

server.connection({
    port: 8000
});

server.route({
    method: 'GET',
    path:'/blog/{title}',
    handler: function (request, reply) {
        fileLoader.loadFile('*' + request.params.title, 'blog').then(function(fileContents) {
            return pageRenderer.render(fileContents, 'blog');
        }).then(function(output) {
            reply(output).type('text/html');
        });

    }
});

server.route({
    method: 'GET',
    path:'/',
    handler: function (request, reply) {
        // If the config option for indexIsBlogList is true, then we need to generate the bloglist
        if (config.indexIsBlogList) {
            fileLoader.loadBlogList(1).then(function(pageData) {
                return pageRenderer.renderBlogList(pageData);
            }).then(function(output) {
                reply(output).type('text/html');
            });
        } else {
            fileLoader.loadFile('index', 'page').then(function(fileContents) {
                return pageRenderer.render(fileContents, 'page');
            }).then(function(output) {
                reply(output).type('text/html');
            });
        }

    }
});

server.route({
    method: 'GET',
    path:'/{slug*}',
    handler: function (request, reply) {
        fileLoader.loadFile(request.params.slug, 'page').then(function(fileContents) {
            return pageRenderer.render(fileContents, 'page');
        }).then(function(output) {
            reply(output).type('text/html');
        });

    }
});



server.start();
