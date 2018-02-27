
var express = require('express');
var bodyParser = require('body-parser');
var flash = require('express-flash');
var validator = require('express-validator');
var app = express();
var path = require('path');
var url = require('url'); 
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var formValidator = require('../lib/formvalidator');
var paginate = require('express-paginate');

//helmet security module
var helmet = require('helmet');

//logging
var logger = require('../lib/logging');

//session modules
var session = require('express-session');
var MemcachedStore = require('connect-memcached')(session);
var cookieParser   = require('cookie-parser');

module.exports = function(app, envConfig){
require('../lib/passport')(passport, LocalStrategy);
app.use(helmet());
app.use(logger);
app.use(cookieParser());
app.use(session({
      secret  : '@alm9fuzVet!k'
    , key     : 'Alm@ster!sdf'
    , proxy   : 'true'
    , resave  : 'false'
    , saveUninitialized: 'true'
    , cookie:{
        maxAge: 2000*60*60 // default session expiration is set to 2 hours
        ,httpOnly: 'true'
        }
    , store   : new MemcachedStore({
        hosts: ['127.0.0.1:11211'],
        ttl: 7200,
        secret: 'almasretescsirkeporkolt' // Optionally use transparent encryption for memcache session data 
    })
}));

//middlewares
app.use(bodyParser.urlencoded({ extended: false }));    
app.use(bodyParser.json());
app.use(validator());
app.use(passport.initialize());
app.use(passport.session());

//static middleware
app.use(express.static('public'));
// keep this before all routes that will use pagination
app.use(paginate.middleware(25, 200));

//set view engine ejs
app.set('view engine', 'ejs');

//use flash messages
app.use(flash());
//

//remember me middleware
app.use( function (req, res, next) {
    if ( req.method == 'POST' && req.url == '/login' ) {
      if ( req.body.rememberme ) {
        req.session.cookie.maxAge = 86400000; // 1*24*60*60*1000 Rememeber 'me' for 1 day
      } else {
        req.session.cookie.expires = false;
      }
    }
    next();
  });


};