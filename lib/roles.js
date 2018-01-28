var ConnectRoles = require('connect-roles');

//connect-roles
var user = new ConnectRoles({
    failureHandler: function (req, res, action) {
      var title = "Hozzáférés megtagadva!"
      // optional function to customise code that runs when
      res.status(403);
      res.render('pages/403', {action: action, title});
    }
 });
//roles
user.use('access admin pages', function (req) {
    if (req.user.roleName === 'Adminisztrátor' || req.user.roleName === 'Shopadmin' ) {
      return true;
    }
  })

user.use('access admin pages', function (req) {
    if (req.user.roleName === 'Adminisztrátor' || req.user.roleName === 'Shopadmin' ) {
      return true;
    }
})

user.use('can handle users', function (req) {
    if (req.user.roleName === 'Adminisztrátor') {
      return true;
    }
})

user.use('can delete product', function (req) {
    if (req.user.roleName === 'Adminisztrátor' || req.user.roleName === 'Shopadmin') {
      return true;
    }
})

module.exports = user;