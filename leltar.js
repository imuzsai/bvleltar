var express = require('express');
var app = express();

// Environments
var env = process.env.NODE_ENV || 'development';
var envConfig = require('./config/env')[env];

// Express configuration
require('./config/config')(app, envConfig);

//other helpers
var isLoggedIn = require(envConfig.rootPath +'./lib/isloggedin.js');
//egyedi mysql kapcsolodasi modul
var mysqlconn = require(envConfig.rootPath +'./lib/dbconnection.js');
global.db = mysqlconn;
var formValidator = require('./lib/formvalidator');
var user = require('./lib/roles.js');
app.use(user.middleware());
var passport = require('passport');

var {myAuthLogger} = require(envConfig.rootPath +'./lib/customlogger.js');
global.authlogger = myAuthLogger;

var {myWooLogger} = require(envConfig.rootPath +'./lib/customlogger.js');
global.woologger = myWooLogger;

//socketio
var server = require('http').createServer(app);  
var io = require('socket.io')(server);
global.ios = io;

// Routes
var product = require(envConfig.rootPath +'./routes/product.js');
var users = require(envConfig.rootPath +'./routes/users.js');
var prodevents = require(envConfig.rootPath +'./routes/prodevents.js');
var riport = require(envConfig.rootPath +'./routes/riport.js');


// =====================================
// LOGIN ===============================
// =====================================
// show the login form
app.get('/login', function(req, res) {
                res.render('pages/login', { flash: req.flash()}); 
});
        
// process the login form
app.post('/login', function(req, res){
        var result = formValidator.loginFormCheck(req,res);
        if(result.status ==0){
        console.log(result.msg);
        req.flash('error', result.msg);
        res.render('pages/login.ejs', { flash: req.flash()}); 
        }
        else{
            //console.log("login");
            passport.authenticate('local-login', {
                successRedirect : '/', // redirect to main page
                failureRedirect : '/login', // redirect back to the signup page if there is an error
                failureFlash : true // allow flash messages
            })(req,res),
            function(req, res) {
                    if (req.body.remember) {
                    req.session.cookie.maxAge = 1000 * 60 * 3;
                    //req.session.cookie.maxAge = 1000;
                    } else {
                    req.session.cookie.expires = false;
                    }
                    res.redirect('/');
            }
        }
});
    
//=================
//Logout===========
//=================
app.get('/logout', function(req, res) {
req.logout();
req.flash('info', "Sikeresen kilépett!");
res.redirect('/login');
});

//termek lista oldal
app.get('/', isLoggedIn, product.list);

//termeklista
app.get('/products', isLoggedIn, product.list);

//termek torlese
app.get('/products/delete/:id', isLoggedIn, user.can('can delete product'), product.delete); //termek adatlapja betoltese

//termek adatai szerkesztesre
app.get('/products/edit/:id', isLoggedIn, product.edit); //termek adatlapja betoltese
app.post('/products/update', isLoggedIn, function(req, res){
    var result = formValidator.prodFormCheck(req,res);
    if(result.status ==0){
    req.flash('error', result.msg);
    res.redirect(req.get('referer')); 
    }
    else{ //mentjuk a termeket ha rendben van a form
        product.update(req,res);
    }
});

//kereses
app.get('/kereses', isLoggedIn, function(req, res){
    var result = formValidator.searchFormCheck(req,res);
    if(result.status == 0){
    req.flash('error', result.msg);
    res.redirect(req.get('referer')); 
    }
    else{ 
        product.searchResults(req,res);
    }
});

//termek hozzaadasa urlap
app.get('/products/add', isLoggedIn, product.add);
//termek urlap ellenorzese es beiras db-be
app.post('/products/add', function(req, res){
    var result = formValidator.prodFormCheck(req,res);
    if(result.status == 0 ){
    req.flash('error', result.msg);
    res.redirect(req.get('referer')); 
    }
    else{ //mentjuk a termeket ha rendben van a form
    product.add(req,res);
    }
    });

///=============== admin functions,pages =============///
//admin dashboard
app.get('/admin', isLoggedIn, user.can('access admin pages'), function(req,res){
    var title = "Admin funkciók";
    var userName = req.user.username;
    res.render('pages/admindashboard', {title,userName});
})
//riportok
app.get('/admin/riports',isLoggedIn, user.can('access admin pages'), riport.list);

//termek muveletek
app.get('/admin/prodevents', isLoggedIn, user.can('access admin pages'), prodevents.list);
//termekmuveletek szurese
app.get('/admin/prodevents/filter', isLoggedIn, function(req, res){
    var result = formValidator.eventsFilterFormCheck(req,res);
    
    if(result.status == 0){
    req.flash('error', result.msg);
    res.redirect(req.get('referer')); 
    }
    else{
        prodevents.list(req,res);
    }
});

//user oldalak lista
app.get('/admin/users', isLoggedIn, user.can('can handle users'), users.list);

//user hozzaadasa
app.get('/admin/users/add', isLoggedIn, user.can('can handle users'), users.add);

// process the signup form
app.post('/admin/users/add', function(req, res){
        var userName = req.user.username;
        var title = "Felhasználó hozzáadása"
        var result = formValidator.signupFormCheck(req,res);
        if(result.status == 1){
        req.flash('error', result.msg);
        res.render('pages/signup.ejs', { title: title, userName: userName, flash: req.flash()}); 
        }
        else{
            console.log("signup");
            passport.authenticate('local-signup', {
                session : false,
                successRedirect : '/admin/users', // redirect to the secure profile section
                failureRedirect : '/admin/users/add', // redirect back to the signup page if there is an error
                failureFlash : true // allow flash messages
            })(req,res);
        }
});

//edit user
app.get('/admin/users/edit/:id', isLoggedIn, user.can('can handle users'), users.edit);
app.post('/admin/users/update', isLoggedIn, function(req, res){
    var result = formValidator.userEditFormCheck(req,res);
    if(result.status == 1){
    req.flash('error', result.msg);
    res.redirect(req.get('referer')); 
    }
    else{ //mentjuk a usert ha rendben van a form
        users.update(req,res);
    }
});

//====================end of admin functions, pages================================//


//===========error logging=======//
//500-as hiba.
app.get('/error', function(req, res,next) {
    var error = req.flash(); 
    //new Error("Express.js will delegate this error to the error handler.");
    next(error);
});

app.use(function(error, req, res, next) {
    console.log("Error handler: ", error);
    // Send an error message to the user.
    res.status(500).json({error:error});
    // Optionally log the request options so you can analyze it later.
});

//404 oldal nem talalhato - MINDIG EZ AZ UTOLSO!!
app.use(function(req, res, next){
    res.status(404);
    res.render('pages/404', {title: "A keresett oldal nem található!"});
});
//=======end of error logggin=====//


//=======starting main server process========//
server.listen(envConfig.port, function(){
    console.log('Szerver elinditva ezen a porton: ' + envConfig.port);
    //console.log(envConfig);
  });
