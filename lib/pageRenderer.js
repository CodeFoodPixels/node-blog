'use strict';

var Promise = require('bluebird'),
    fs = Promise.promisifyAll(require('fs')),
    handlebars = require('handlebars'),
    markdown = require('markdown-it')('commonmark'),
    parentTemplate = 'default',
    config = require('../config.js');

handlebars.registerHelper('parent', function(parent) {
    parentTemplate = parent;
    return '';
});

module.exports = {
    render: function(content, contentType) {
        var metadata = this.getMetadata(content),
            templateName = contentType || metadata.template,
            htmlContent,
            templatedContent;

        parentTemplate = 'default';

        content = content.replace(/^\/\*([\s\S]*)\*\//, '').trim();

        htmlContent = markdown.render(content);

        return fs.readFileAsync('./themes/'+ config.theme + '/' + templateName + '.hbs').then(function(file) {
            var template = handlebars.compile(file.toString());

            templatedContent = template({
                content: htmlContent,
                meta: metadata
            });

            return fs.readFileAsync('./themes/' + config.theme + '/' + parentTemplate + '.hbs');
        }).then(function(file) {
            var finalPage = handlebars.compile(file.toString());

            return finalPage({
                body: templatedContent,
                meta: metadata
            });
        });
    },

    getMetadata: function(content) {
        var metadataBlock = content.match(/^\/\*([\s\S]*)\*\//);

        if (metadataBlock && metadataBlock[1]) {
            let metadata = metadataBlock[1].trim(),
                metadataObj = {};

            metadata = metadata.split('\n');

            for (let i = 0; i < metadata.length; i++) {
                let item = metadata[i].split(':');

                metadataObj[item[0].trim().toLowerCase()] = item[1].trim();
            }

            return metadataObj;
        }

        return {};
    },

    renderBlogList: function(pageData) {
        var templatedContent;

        pageData.posts = pageData.posts.map((value) => {
            return {
                link: value.link,
                meta: this.getMetadata(value.post),
                content: markdown.render(value.post.replace(/^\/\*([\s\S]*)\*\//, '').trim())
            }
        });

        parentTemplate = 'default';

        return fs.readFileAsync('./themes/'+ config.theme + '/bloglist.hbs').then(function(file) {
            var template = handlebars.compile(file.toString());

            templatedContent = template(pageData);

            return fs.readFileAsync('./themes/' + config.theme + '/' + parentTemplate + '.hbs');
        }).then(function(file) {
            var finalPage = handlebars.compile(file.toString());

            return finalPage({
                body: templatedContent,
                meta: ''
            });
        });
    }
};
