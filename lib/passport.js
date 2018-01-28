// config/passport.js
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var bcrypt = require('bcrypt-nodejs');

// expose this function to our app using module.exports
module.exports = function(passport,LocalStrategy) {

    // =========================================================================
    // passport session setup ==================================================
    // =========================================================================
    // required for persistent login sessions
    // passport needs ability to serialize and unserialize users out of session

    // used to serialize the user for the session
    passport.serializeUser(function(user, done) {
        done(null, user.id);
    });

    // used to deserialize the user
    passport.deserializeUser(function(id, done) {
        //db.query("SELECT * FROM tbl_users WHERE id = ? ",[id], function(err, rows){
            db.query("SELECT tbl_users.*,tbl_roles.roleName FROM tbl_users,tbl_roles WHERE tbl_users.roleId=tbl_roles.id and tbl_users.id = ? ",[id], function(err, rows){
            done(err, rows[0]);
            //done(null,false);
        });
    });

    // =========================================================================
    // LOCAL SIGNUP ============================================================
    // =========================================================================
    passport.use(
        'local-signup',
        new LocalStrategy({
            // by default, local strategy uses username and password, we will override with email
            usernameField : 'username',
            passwordField : 'password',
            passReqToCallback : true // allows us to pass back the entire request to the callback
        },
        function(req, username, password, done) {
            db.query("SELECT * FROM tbl_users WHERE username = ?", [username], function(err, rows) {
                if (err)
                    return done(err);
                if (rows.length) {
                    return done(null, false, req.flash('error', 'A felhasználónév "'+username+'" már foglalt!'));
                } else {
                    // if there is no user with that username
                    // create the user
                    var newUserMysql = {
                        username: username,
                        password: bcrypt.hashSync(password, null, null),
                        status: 1,
                        roleId: req.body.roleSelect //
                    };
                    
                    var insertQuery = "INSERT INTO tbl_users ( username, password, status, roleId ) values (?,?,?,?)";
                    db.query(insertQuery,[newUserMysql.username, newUserMysql.password,newUserMysql.status,newUserMysql.roleId],function(err, rows) {
                        newUserMysql.id = rows.id;
                        return done(null, newUserMysql,req.flash('info', 'Sikeres regisztráció!'));
                    });
                }
            });
        })
    );
    // =========================================================================
    // LOCAL LOGIN =============================================================
    // =========================================================================

    passport.use(
        'local-login',
        new LocalStrategy({
            // by default, local strategy uses username and password, we will override with email
            usernameField : 'username',
            passwordField : 'password',
            passReqToCallback : true // allows us to pass back the entire request to the callback
        },
        function(req, username, password, done) { // callback with email and password from our form
            db.query("SELECT tbl_users.id, tbl_users.username, tbl_users.password, tbl_users.status, tbl_roles.roleName FROM tbl_users,tbl_roles WHERE tbl_users.roleId=tbl_roles.id and username = ?", [username], function(err, rows){
                if (err)
                return done(err);
                var ip = req.header('x-forwarded-for') || req.connection.remoteAddress;
                if (!rows.length) {
                    authlogger.warn('Sikertelen belepes! Felhasznalónév: ', username , ' IP: ', ip);
                    return done(null, false, req.flash('error', 'Hibás felhasználónév!')); // req.flash is the way to set flashdata using connect-flash
                }

                if (rows[0].status == "0") {
                    authlogger.warn('Kikapcsolt felhasználó! Felhasznalónév: ', username , ' IP: ', ip);
                    return done(null, false, req.flash('error', 'A felhasználó ki van kapcsolva, belépés nem lehetséges!')); // req.flash is the way to set flashdata using connect-flash
                }

                // if the user is found but the password is wrong
                if (!bcrypt.compareSync(password, rows[0].password)){
                    authlogger.warn('Hibás jelszó! Felhasznalónév: ', username , ' IP: ', ip);
                    return done(null, false, req.flash('error', 'Hibás jelszó!')); // create the loginMessage and save it to session as flashdata
                }
                // all is well, return successful user
                //req.user.role=rows[0].roleName;
                console.log(rows[0].roleName);
                authlogger.info('Sikeres belepes! Felhasznalónév: ', username , ' IP: ', ip);
                return done(null, rows[0]);
            });
        })
    );

};