var path = require('path');
var rootPath = path.normalize(__dirname + '/../'); // normalizes to base path

module.exports = {
    development: {
        rootPath: rootPath,
        port: process.env.PORT || 8080
    },
    production: {
        rootPath: rootPath,
        port: process.env.PORT || 9898
    }
};