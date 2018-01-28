var bcrypt = require('bcrypt-nodejs');

exports.list = function(req, res, error) {
    var userName = req.user.username;
    db.query('SELECT tbl_users.id,tbl_users.username,tbl_users.status,tbl_roles.roleName from tbl_users LEFT JOIN tbl_roles on tbl_users.roleId = tbl_roles.id order by tbl_users.id DESC limit ?', 
    25, function(err, results) {
        if (err) {
            req.flash('error', err);
            res.redirect('/error');
            
        } else {
                var title = "Felhasználók listája";
                //console.log(results);
                pageCount = 1;
                res.render('pages/users', {
                    flash: req.flash(),
                    results,
                    pageCount,
                    title,
                    userName
                  });            
        }
        });
}

exports.add = function(req, res) {
        var userName = req.user.username;
        title = "Felhasználó hozzáadása"
        result = "";
        res.render('pages/signup', { result, title, userName, flash: req.flash() });
}

exports.edit = function(req, res) {
    var userid = req.params.id;
    var userName = req.user.username;
    var message = '';
    db.query("SELECT * FROM `tbl_users` WHERE `id`= ?", [userid] , function(err, result) {
        if (err) {
            req.flash('error', err);
            res.redirect('/error');

        } else {
            //console.log(result);
            title = "Felhasználó szerkesztése";
            res.render('pages/edituserform', { layout:false, result, title, userName, flash: req.flash() });
            //mysqlconn.end();                
        }
        //mysqlconn.end();
    });
    
}

exports.update = function(req, res) {
    var userName = req.user.username;
    if (req.method == "POST") {
        var id = req.body.userId;
        var username = req.body.username; //ez egyedi ezt ellenorizni kell benne van-e mar db-ben
        var status = req.body.statusSelect;
        var role = req.body.roleSelect;
        var password = req.body.password;
            //username already exists
            var sql = "SELECT * from `tbl_users` where `username` = ?";
            var query = db.query(sql, [username], function(err, result) {
                if (err){
                req.flash('error', err);
                res.redirect('/error');
                /* } else {
                if (result.length) {
                    console.log("username mar foglalt");
                    req.flash('error', "Már létező Felhasználónév!");
                    res.redirect(req.get('referer')); */
                } else { //nincs meg benne a user
                //jelszo megvan-e adva, ha igen akkor azt cryptelni kell es ugy berakni db-be
                    if (password){
                        var dbpassword = bcrypt.hashSync(password, null, null);
                        var sql = "UPDATE tbl_users SET `username` = ?, `password` = ?, `status` = ?, `roleId`= ? where `id`=?";
                        var query = db.query(sql, [username,dbpassword,status,role,id], function(err, result) {
                            if (err) {
                                req.flash('error', "Sikertelen frissítés, ellenőrizd az adatokat!");
                                res.redirect(req.get('referer')); 
                            } else {
                                req.flash('info', "Sikeresen frissítette a felhasználót! Név: '"+username+"' ");
                                res.redirect('/admin/users');        
                            }
                            //mysqlconn.end();
                            }); 
                    } else {
                        var sql = "UPDATE tbl_users SET `username` = ?, `status` = ?, `roleId`= ? where `id`= ? ";
                        var query = db.query(sql, [username,status,role,id], function(err, result) {
                            if (err) {
                                console.log(err);
                                req.flash('error', "Sikertelen frissítés, ellenőrizd az adatokat!");
                                res.redirect(req.get('referer')); 
                            } else {
                                req.flash('info', "Sikeresen frissítette a felhasználót! Név: '"+username+"' ");
                                res.redirect('/admin/users');        
                            }
                            //mysqlconn.end();
                            }); 
                    }
                }
        });
    }
}