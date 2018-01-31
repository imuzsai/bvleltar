var async = require('async');


exports.list = function(req, res, error) {
    var userName = req.user.username;
    //*asysnc test
    async.auto([
        getStocks,
        getEventCounts, //termekmuveletek szama elmult 7 napban napi szinten
        getAllEventCounts,//osszes muvelet elmult 7 napban
        getEventDetails //melyik user hany muveletet vegzett
    ], function (error, results) {
        if (error) { 
        console.log('Hiba!'); 
        console.log(error);
        //req.flash('error', error);
        //res.redirect('/error');
        } 
        else {
        console.log('Done!');
        //console.log(results);
   
            var string = JSON.stringify(results);
            var json =  JSON.parse(string);
            console.log(json);
            var eventCounts = json[1];
            var allEventCounts = json[2][0].alleventsnum;
            var eventStats = json[3][2];

            var allProdsCount = json[0][0].allprodsnum;
            var inStockCount = json[0][0].instocknum;
            var notInStockCount = allProdsCount - inStockCount;
                var title = "Riportok";
                pageCount = 1;
                res.render('pages/riports', {
                    flash: req.flash(),
                    results,
                    pageCount,
                    title,
                    allProdsCount,
                    inStockCount,
                    notInStockCount,
                    eventCounts,
                    allEventCounts,
                    eventStats,
                    userName
                  });
                  //send to socket
                  //ios.emit('chartdata', json);       
            }          
        });
}

function getStocks(callback){
    db.query('SELECT (SELECT count(product_id) as a from tbl_prods)as allprodsnum, (SELECT count(product_id) as b from tbl_prods where quantity > 0)as instocknum', function (err,result){
            if(err){
                callback (err,null);
            }else{
                callback (null,result)
            }
    });
}

function getEventCounts(callback){        
    db.query('select DATE(date) as date, count(productid) as eventnum from tbl_prodevents \
    where DATE(date) BETWEEN (NOW() - INTERVAL 7 DAY) AND NOW() group by DATE(date) order by date ASC', function (err,result){
            if(err){
                callback (err,null);
            }else{
                callback (null,result)
            }
    });
}

function getAllEventCounts(callback){
    db.query('select count(id) as alleventsnum from tbl_prodevents where DATE(date) BETWEEN (NOW() - INTERVAL 7 DAY) AND NOW()', function (err,result){
            if(err){
                callback (err,null);
            }else{
                callback (null,result)
            }
    });
}

function getEventDetails(callback){
    db.query('DROP table if exists t2;\
    CREATE TEMPORARY TABLE IF NOT EXISTS t2 as \
    SELECT  t.nap, (select username from tbl_users where id=userid) as username, count(*) as db \
    FROM (select DATE(date) as nap, userid, event from tbl_prodevents where DATE(date) BETWEEN (NOW() - INTERVAL 7 DAY) AND NOW()) t \
    GROUP BY t.nap, t.userid;\
    SELECT \
      nap,\
      MAX(CASE WHEN (username = "adminuser") THEN db ELSE 0 END) AS adminuser, \
      MAX(CASE WHEN (username = "shopadmin") THEN db ELSE 0 END) AS shopadmin, \
      MAX(CASE WHEN (username = "adatrogzito") THEN db ELSE 0 END) AS adatrogzito \
    FROM\
      t2\
    GROUP BY nap\
    ORDER BY nap;', function (err,result){
            if(err){
                callback (err,null);
            }else{
                callback (null,result);
            }
    });
}
