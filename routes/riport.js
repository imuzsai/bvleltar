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
            var eventStats = json[3];

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
    where DATE(date) > "2018-01-09" group by DATE(date) order by date ASC', function (err,result){
            if(err){
                callback (err,null);
            }else{
                callback (null,result)
            }
    });
}

function getAllEventCounts(callback){
    db.query('select count(id) as alleventsnum from tbl_prodevents where DATE(date) > "2018-01-09"', function (err,result){
            if(err){
                callback (err,null);
            }else{
                callback (null,result)
            }
    });
}

function getEventDetails(callback){
    db.query('SELECT  t.nap, (select username from tbl_users where id=userid) as username, count(*) as db \
    FROM (select DATE(date) as nap, userid, event from tbl_prodevents) t \
    GROUP BY t.nap, t.userid', function (err,result){
            if(err){
                callback (err,null);
            }else{
                callback (null,result)
            }
    });
}
