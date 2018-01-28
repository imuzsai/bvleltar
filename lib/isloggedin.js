// middleware to check is authenticated
module.exports = function isLoggedIn(req, res, next) {
    // if user is authenticated in the session, carry on
    if (req.isAuthenticated())
    //global.username = req.user.username;
    //global.role = req.user.role;
    return next();
    // if they aren't redirect them to the home page
    res.redirect('/login');
};