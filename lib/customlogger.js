var path = require('path');
var fs = require('fs');
var rfs = require('rotating-file-stream');
var morgan = require('morgan');
var logDirectory = path.join(__dirname, '../log');

//custom logger for auth and woocommerce logs
// create a rolling file logger based on date/time that fires process events
var authlogopts = {
        //errorEventName:'error',
        logDirectory: logDirectory, // NOTE: folder must exist and be writable...
        fileNamePattern:'auth-<DATE>.log',
        dateFormat:'YYYY.MM.DD'
};
var myAuthLogger = require('simple-node-logger').createRollingFileLogger( authlogopts );

var woologopts = {
    //errorEventName:'error',
        logDirectory: logDirectory, // NOTE: folder must exist and be writable...
        fileNamePattern:'woocommerce-<DATE>.log',
        dateFormat:'YYYY.MM.DD'
};
var myWooLogger = require('simple-node-logger').createRollingFileLogger( woologopts );
module.exports = {myWooLogger,myAuthLogger};