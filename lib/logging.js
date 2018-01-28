///===logging===///
var path = require('path');
var fs = require('fs');
var rfs = require('rotating-file-stream');
var morgan = require('morgan');
var logDirectory = path.join(__dirname, '../log');

// ensure log directory exists
fs.existsSync(logDirectory) || fs.mkdirSync(logDirectory);

// create a rotating write stream
var errorLogStream = rfs('error.log', {
  interval: '1d', // rotate daily
  compress: 'gzip', // tomorites gzip-pel
  path: logDirectory
});

// create a rotating write stream
var accessLogStream = rfs('access.log', {
    interval: '1d', // rotate daily
    compress: 'gzip', // tomorites gzip-pel
    path: logDirectory
  }); 


//logging middleware function
var myLogger = function (req, res, next) {
            var a = morgan('combined', {stream: accessLogStream});
            var e = morgan('dev', {stream: errorLogStream,
                skip: function (req, res) { return res.statusCode < 400 }
                });
            a (req, res, function (err) {
                if (err) return done(err)});
            e (req, res, function (err) {
                if (err) return done(err)}); 
            next();
};  
module.exports = myLogger;    
//--------------------end of logging--------------//
