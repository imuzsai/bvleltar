var paginate = require('express-paginate');
var async = require('async');


exports.list = function(req, res, error) {
    var userName = req.user.username;  
      //console.log(req.query);
    //*asysnc test
    async.auto([
        getUsers,
        getDates
        //getProdEvents
    ], function (error, results) {
        if (error) { console.log('Hiba!'); 
        //req.flash('error', error);
        //res.redirect('/error');
        }
        //console.log('Done!');
        //console.log(results[1]);
        var dateSelectorVals = results[1];
        var userSelectorVals = results[0];
        //console.log(dateSelectorVals[0].endDate);
        //console.log(userSelectorVals);
        //a selectorba csak az ev-honap-nap kell
        var dateSelectorStart = ((dateSelectorVals[0].startDate).split(" "))[0];
        var dateSelectorEnd = ((dateSelectorVals[0].endDate).split(" "))[0];
        //itt dontjuk el van-e filter a listan
        if(typeof req.query.isFilter == 'undefined'){
        //console.log("nincs filter");
        //elmult 1 het esemenyei
        var sql = 'select tbl_prodevents.*, tbl_prods.*, tbl_users.username from tbl_prodevents \
        left join tbl_prods on tbl_prodevents.productid=tbl_prods.product_id \
        left join tbl_users on tbl_prodevents.userid = tbl_users.id \
        where DATE(tbl_prodevents.date) BETWEEN (NOW() - INTERVAL 7 DAY) AND NOW() order by tbl_prodevents.date DESC';
        }else{
            //ha van filter akkor a szuro inputok a beallitott erteket jelenitik meg
            //a szuresi felteteleket attol fuggoen kell sql-be fuzni, hogy mi van megadva
            //console.log("van filter");
            var filterArray = [];
            var sqlBaseString = 'select tbl_prodevents.*, tbl_prods.*, tbl_users.username from tbl_prodevents \
            left join tbl_prods on tbl_prodevents.productid=tbl_prods.product_id \
            left join tbl_users on tbl_prodevents.userid = tbl_users.id \
            where ';
            var dateFilterString = "DATE(tbl_prodevents.date) between '"+req.query.startDateSelect+"' and '"+req.query.endDateSelect+"' order by tbl_prodevents.date DESC";
            if(req.query.eventSelect){
                filterArray.push("tbl_prodevents.event = '"+req.query.eventSelect+"'");
            }
            if(req.query.userSelect){
                filterArray.push("tbl_users.username = '"+req.query.userSelect+"'");
            }
            
            if(req.query.productIdInput){
                filterArray.push("tbl_prodevents.productid = '"+req.query.productIdInput+"'");
            }
            if(filterArray.length>0){
                var filterString = "";
                var s = "";
                filterArray.forEach(element => {
                filterString += s+element;
                s=" and ";
                });
                var sql = sqlBaseString+" "+filterString+" "+s+" "+dateFilterString;
            }else{
                var sql = sqlBaseString+" "+dateFilterString;
            }

            //console.log("ez az: "+sql);
        }
        //sql lekeres
        db.getConnection(function(err, connection) {
        connection.query(sql , function(err, rows) {
            connection.release();
            if (err) {
            req.flash('error', err);
            res.redirect('/error');
            } else {
            if(rows.length==0){//ha nincs eredmeny
                 var title = "Nincs találat!";
                 var pageCount = 0;
                 var results = [];
                 req.flash('error', "Nincs a szűrési feltételeknek megadott elem!");
                 res.render('pages/prodevents', {
                    flash: req.flash(),
                    results,
                    pageCount,
                    itemCount,
                    title,
                    userName,
                    userSelectorVals,
                    dateSelectorStart,
                    dateSelectorEnd,
                    pages: paginate.getArrayPages(req)(5, pageCount, req.query.page)
                  });
            }
            else{
            var results = [];
            var title = "Események listája";
            var itemCount = rows.length;
                var start = (req.query.page - 1) * req.query.limit;
                var end = (req.query.page * req.query.limit) - 1;
                var pageCount = Math.ceil(itemCount / req.query.limit);
                for(i=start; i<=end; i++){
                results.push(rows[i]); 
                if(i>=itemCount-1){ //csak az utolso elemszamig mehetunk
                break;
                }
                }
                var vege = (end<itemCount)? end:itemCount;
                //req.flash('info', "Találatok száma: "+itemCount+ " - Találati lista "+(start+1)+"-tól "+((end<itemCount)? end:itemCount)+"-ig!");
                res.render('pages/prodevents', {
                    flash: req.flash(),
                    results,
                    pageCount,
                    itemCount,
                    title,
                    userName,
                    userSelectorVals,
                    dateSelectorStart,
                    dateSelectorEnd,
                    pages: paginate.getArrayPages(req)(5, pageCount, req.query.page)
                  });
            }
        }
    });
    });        
});
}

function getUsers(callback){
    db.getConnection(function(err, connection) {
    connection.query('select username from tbl_users order by username DESC', function (err,result){
        connection.release();
        if(err){

            callback (err,null);
        }else{
            //console.log(result);
            //a userneveket berakjuk egy tombbe
            var users = [];
            result.forEach(element => {
                users.push(element.username);
            });
            //console.log(users);
            callback (null,users)
        }
    });
});
}

function getDates(callback){
    db.getConnection(function(err, connection) {
    db.query('select max(date) as endDate, min(date) as startDate from tbl_prodevents', function (err,result){
        connection.release();
        if(err){
             callback (err,null);
        }else{
            var string = JSON.stringify(result);
            var json =  JSON.parse(string);
             //console.log(result);
             callback (null,json)
        }
    });
});
}   


