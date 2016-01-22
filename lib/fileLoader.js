'use strict';

var Promise = require('bluebird'),
    fs = Promise.promisifyAll(require('fs')),
    glob = Promise.promisifyAll(require('glob')),
    config = require('../config.js');

module.exports = {
    loadFile: function(slug, type) {
        return this.getFilenameFromSlug(slug, type).then(function(path) {
            return fs.readFileAsync(path).then(function(contents) {
                return contents.toString();
            });
        });
    },

    getFilenameFromSlug: function(slug, type) {
        var path = './content/' + type;

        return glob.globAsync(path + '/' + slug + '.md').then(function(files) {
            return files[0];
        });
    },

    loadBlogList: function(page) {
        var path = './content/blog';

        return fs.readdirAsync(path).then(function(files) {
            var startNum = (page - 1) * config.blogPostsPerPage,
                pageData = {
                    prevPage: !!startNum > 0,
                },
                posts = [];

            files.sort(function (a, b) {
                if (a < b) {
                    return 1;
                }
                if (a > b) {
                    return -1;
                }
                // a must be equal to b
                return 0;
            });

            pageData.nextPage = !!(startNum + config.blogPostsPerPage + 1) < files.length;

            pageData.posts = [];

            files = files.slice(startNum, startNum + config.blogPostsPerPage)

            files.forEach(function(post) {
                posts.push(fs.readFileAsync(path + '/' + post));
            });

            return Promise.each(posts, function(postContent, index){
                pageData.posts.push({
                    link: files[index],
                    post: postContent.toString()
                });
            }).then(function(){
                return pageData;
            });
        }.bind(this));
    }
}
