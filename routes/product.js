var paginate = require('express-paginate');
var sortBy = require('array-sort');
//Woocommerce
var woocommerce = require('../lib/woocommerce.js');
//socketio
ios.on('connection', function(socket){
    //console.log("a user connected");
});


exports.add = function(req, res) {
    var userid = req.user.id;
    if (req.method == "POST") {
    var sess = req.session;
    var prodid = req.body.prodId;
    var prodsku = req.body.prodSku; //ez egyedi ezt ellenorizni kell benne van-e mar db-ben
    var name = req.body.prodName;
    var qty = req.body.prodQty;
    var price = req.body.prodPrice;
    var comment = req.body.prodComment;
    db.getConnection(function(err, connection) {
    var sql = "SELECT * from `tbl_prods` where `product_sku` = ?";
    connection.query(sql, [prodsku], function(err, result) {
        if (result.length>0) {
            connection.release();
            //console.log("benne van az sku");
            req.flash('error', "Már létező SKU!");
            res.redirect(req.get('referer')); 
        } else {
            var sql = "SET @userid = '"+userid+"';Insert INTO tbl_prods (`product_sku`, `product_name`, `quantity`, `price`, `comment`) values (?,?,?,?,?)";
            connection.query(sql, [prodsku,name,qty,price,comment], function(err, result) {
                connection.release();
                if (err) {
                    //console.log(result);
                    req.flash('error', "Sikertelen rögzítés, próbálja újra!");
                    res.redirect(req.get('referer'));
                } else {
                    req.flash('info', "Sikeresen rögzítette a terméket! Név: '"+name+"' ");
                    res.redirect('/');       
                }
                //mysqlconn.end();
                }); 
        }          
    });
    });
    }else{
        var userName = req.user.username;
        title = "Termék hozzáadása"
        result = "";
        res.render('pages/productform', { result, title, userName, flash: req.flash() });
    }    
             
}


exports.edit = function(req, res) {
    var prodid = req.params.id;
    var userName = req.user.username;
    var message = '';
    var imgurl = "";
    var extData = {};
    db.getConnection(function(err, connection) {
    connection.query("SELECT * FROM `tbl_prods` WHERE `product_id`= ?", [prodid] , function(err, result) {
        connection.release();
        if (err) {
            req.flash('error', err);
            res.redirect('/error');
        } else {
            //woocommerce adatok lekerdezese a termekhez
            //console.log(result[0].product_sku);
            //leszedjuk a woocommerce infokat, ha megjönnek socket.io-val behuzzuk a html-be
                woocommerce.get('products/?filter[sku]='+result[0].product_sku+'', function(err, data, res) {
                //woocommerce.get('products/?filter[sku]=BV0188', function(err, data, res) { //ez a tesztsor a hibak szimulalasara
                if(res){
                var obj = JSON.parse(res);
                //console.log(obj);
                //product objektum vagy error jott vissza
                //ha product akkor az üres-e
                if(typeof obj.products != 'undefined'){
                    if(obj.products.length){
                    //console.log( obj.products[0].featured_src );
                    extData.id = obj.products[0].id;
                    extData.title = obj.products[0].title;
                    extData.sku = obj.products[0].sku;
                    imgurl = obj.products[0].featured_src;
                    extData.permalink = obj.products[0].permalink;
                    extData.imgurl = obj.products[0].featured_src;
                    extData.qty = obj.products[0].stock_quantity;
                    extData.price = obj.products[0].regular_price;
                    if (obj.products[0].sale_price){
                    extData.salePrice = obj.products[0].sale_price;
                    }else{
                    extData.salePrice = '';
                    }
                    extData.totalSale = obj.products[0].total_sales; 
                    //send data to socketio
                    ios.emit('data', extData);
                    }
                    else{
                        console.log("ures products jott vissza");
                        woologger.warn('Termék nem létezik a webáruházban. SKU: ', result[0].product_sku );
                        ios.emit('extConnErr','Termék nem található a webáruházban!');
                    }
                }else
                    {
                        if(typeof obj.errors != 'undefined'){
                        //console.log(obj.errors);
                        woologger.error('Webáruház lekérdezés hiba! ', obj.errors[0].message);
                        ios.emit('extConnErr',obj.errors[0].message);
                        } else 
                            {
                            ios.emit('extConnErr','Hiba a kapcsolat felépítése során!');
                            console.log ("nem jott valasz");
                            woologger.error('Webáruház kapcsolódási hiba! ');
                            }
                        }
                    }
                });
            title = "Termék szerkesztése"
            res.render('pages/productform', { layout:false, result, title, userName, flash: req.flash() }, function(err, html) {
                if (err) {
                    req.flash('error', err);
                    res.redirect('/error');
        
                } else {
                    res.send(html);
                    //ios.emit('extConnErr','Kérem várjon!');
                }
            });       
        }
    });
    });
    
}


exports.update = function(req, res) {
    var userid = req.user.id;
    if (req.method == "POST") {
        
        //adatfrissiteshez a mezok a post-bol
        //
        //console.log(req.body);
        var data = {"skuChange":req.body.skuChange,"userId":req.user.id, "prodId":req.body.prodId, "prodSku":req.body.prodSku,"prodName":req.body.prodName,"prodQty":req.body.prodQty,"prodPrice":req.body.prodPrice,"prodComment":req.body.prodComment};
        //ha a checkbox be volt pipalva akkor ossze kell rakni a webadat-t es akkor meghivni a frissitot is
        //az sku ellenorzes woo oldalon tortenik //az ar mezoket egyeztetni kell
        if(req.body.checkWebEdit){
            if(req.body.prodSalePriceWeb){//az ar mezok beallitasa
                var webData = {"userId":req.user.id,"prodIdWeb":req.body.prodIdWeb,"prodSkuWeb":req.body.prodSkuWeb,"prodNameWeb":req.body.prodNameWeb,"prodQtyWeb":req.body.prodQtyWeb,"prodPriceWeb":req.body.prodSalePriceWeb,"prodSalePriceWeb":req.body.prodSalePriceWeb,"prodRegPriceWeb":req.body.prodPriceWeb}; 
            }else{
                var webData = {"userId":req.user.id,"prodIdWeb":req.body.prodIdWeb,"prodSkuWeb":req.body.prodSkuWeb,"prodNameWeb":req.body.prodNameWeb,"prodQtyWeb":req.body.prodQtyWeb,"prodPriceWeb":req.body.prodPriceWeb,"prodSalePriceWeb":req.body.prodSalePriceWeb,"prodRegPriceWeb":req.body.prodPriceWeb}; 
            }
        
        }
        
        updateProduct(data, function(err, result) {
                            if (result == "skuexists"){
                                req.flash('error', "Sikertelen frissítés, SKU már létezik az adatbázisban!");
                                res.redirect(req.get('referer')); 
                            }else{
                            
                            if (err) {
                                   req.flash('error', "Sikertelen frissítés, próbálja újra!");
                                   res.redirect(req.get('referer')); 
                       
                               } else {
                                    if(req.body.checkWebEdit){
                                        ios.emit('extConnErr',"Csatlakozás webáruházhoz - Kérem várjon...");
                                        updateWebData(webData, function(err, result){
                                            if (err) {
                                                req.flash('error', "Sikertelen webáruház adatfrissítés. Hiba: "+err );
                                                res.redirect(req.get('referer')); 
                                            }else{
                                                req.flash('info', "Sikeresen frissítette a terméket! <a href=javascript:history.go(-2)> Vissza </a> ");
                                                res.redirect(req.get('referer')); 
                                            }

                                        });
                                    }else{
                                        req.flash('info', "Sikeresen frissítette a terméket! <a href=javascript:history.go(-2)> Vissza </a> ");
                                        res.redirect(req.get('referer'));
                                    }
                               }
                            }
                   });          
       
    } else {
        res.render('pages/productform', {req: req.body,flash: req.flash()});
    }
    
}

exports.searchResults = function(req,res){
    var keresszoveg = req.query.keresSzoveg.trim();
    //var sradio  = req.query.sradio;
    var sortparam  = req.query.sort;
    var sortorder = req.query.order;
    var userName = req.user.username;
    var title = "Keresési eredmények";
    if(keresszoveg.indexOf(' ') > -1){ //ha osszetett a kereses akkor vagy kapcsolat kell
        var resArr = keresszoveg.split(" ");
        var s = "";
        var z = "";
        var x = "";
        var searchString = "";
        var searchString2 = "";
        resArr.forEach(element => {
            searchString += s+z+"'%"+element+"%'";
            searchString2 += s+x+"'%"+element+"%'";
            s=" and ";
            z=" product_name LIKE ";
            x=" product_sku LIKE ";
        });
        //console.log(searchString);
        //console.log(searchString2);
        var sql = "select t.*, (SELECT id FROM tbl_prodevents where tbl_prodevents.productid in (t.product_id) order by id DESC limit 1) as eventid,\
        (select tbl_prodevents.date from tbl_prodevents where id=eventid) as date,\
        (select tbl_users.username from tbl_users,tbl_prodevents where tbl_prodevents.id=eventid and tbl_prodevents.userid=tbl_users.id) as username\
        FROM (select tbl_prods.* from tbl_prods \
        WHERE tbl_prods.product_name LIKE "+searchString+" OR tbl_prods.product_sku LIKE "+searchString2+" \
        order by tbl_prods.product_name DESC) t";
        //console.log(sql);
    }else{
        var sql = "select t.*, (SELECT id FROM tbl_prodevents where tbl_prodevents.productid in (t.product_id) order by id DESC limit 1) as eventid,\
        (select tbl_prodevents.date from tbl_prodevents where id=eventid) as date,\
        (select tbl_users.username from tbl_users,tbl_prodevents where tbl_prodevents.id=eventid and tbl_prodevents.userid=tbl_users.id) as username \
        FROM (select tbl_prods.* from tbl_prods \
        WHERE tbl_prods.product_sku like '%"+keresszoveg+"%' OR tbl_prods.product_name like '%"+keresszoveg+"%' \
        order by tbl_prods.product_name DESC) t";
        //console.log(sql);
    }
    
    //console.log(sql);
    //ossze kell allitani a queryt ha szabad szavas kereses es space van kozottuk
    db.getConnection(function(err, connection) {
    connection.query(sql, function(err, rows) {
        connection.release();
        if (err) {
            req.flash('error', err);
            res.redirect('/error');
        } else {
            if(rows.length==0){//ha nincs eredmeny
                var title = "Nincs találat!";
                res.render('pages/noresults', {title,userName});  
            }
            else{
            var results = [];
            var itemCount = rows.length;
            //adatbazis eredmeny rendezese az urlapbol jott parameterek alapjan
            if(sortorder == "desc"){
            sortBy(rows, sortparam, {reverse: true});
            }else{
                sortBy(rows, sortparam, {reverse: false});
            }
            //ide kell pagination ahol az objektbol X-esevel kilistazzuk az elemeket
                //console.log("pagination");
                //console.log("Az itemszam:" +itemCount);
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
                req.flash('info', "Találatok száma: "+itemCount+ " - Találati lista "+(start+1)+"-tól "+((end<itemCount)? end:itemCount)+"-ig!");
                res.render('pages/products', {
                    flash: req.flash(),
                    results,
                    pageCount,
                    itemCount,
                    title,
                    userName,
                    pages: paginate.getArrayPages(req)(5, pageCount, req.query.page)
                  });
            }
        }
    });
    });
}

exports.list = function(req, res, error) {
    var userName = req.user.username;
    db.getConnection(function(err, connection) {
    connection.query('select t.*, (SELECT id FROM tbl_prodevents where event not like "%Termék törlése%" \
    and tbl_prodevents.productid in (t.product_id) order by id DESC limit 1) as eventid,\
    (select tbl_prodevents.date from tbl_prodevents where id=eventid) as date,\
    (select tbl_users.username from tbl_users,tbl_prodevents where tbl_prodevents.id=eventid \
    and tbl_prodevents.userid=tbl_users.id) as username\
    FROM (select tbl_prods.* from tbl_prods\
    order by tbl_prods.product_sku DESC limit ?) t', 50, function(err, results) {
        connection.release();
        if (err) {
            req.flash('error', err);
            res.redirect('/error');
            
        } else {
                //console.log(results);
                var title = "Terméklista";
                pageCount = 1;
                res.render('pages/products', {
                    flash: req.flash(),
                    results,
                    pageCount,
                    title,
                    userName
                  });            
        }
        });
    });
}

exports.delete = function(req,res){
    var userName = req.user.username;
    var userid = req.user.id;
    var prodid = req.params.id;
    //console.log(prodid);
    db.getConnection(function(err, connection) {
    connection.query("SET @userid = '"+userid+"'; DELETE FROM tbl_prods WHERE product_id = ?", [prodid] , function(err, result) {
        connection.release();
        if (err) {
            req.flash('error', err);
            res.redirect('/error');

        } else {
            req.flash('info', "Termek törlése sikeresen megtörtént!");
            res.redirect('/');                
        }
    });
});
}

//termek frissitese a webaruhaz adatbazisaban rest api-val
function updateWebData(webData,callback){
    var date = new Date();
    //console.log(date);
    var prodData = {
        "product": {
            "created_at": 'date',
            "sku": webData.prodSkuWeb,
            "title": webData.prodNameWeb,
            "stock_quantity": webData.prodQtyWeb,
            "price": webData.prodPriceWeb,
            "regular_price": webData.prodRegPriceWeb,
            "sale_price": webData.prodSalePriceWeb
        }
      };
    woocommerce.put('products/'+webData.prodIdWeb+'', prodData, function(err, data, response) {
        if(response){
            var obj = JSON.parse(response);
            //console.log(obj);
                if(typeof obj.errors != 'undefined'){
                    callback(obj.errors[0].message, err);
                }else{
                    
                    callback(null, response);
                }
        }else{
            
            callback(err, err);
        }
    });
}

//termek frissitese a helyi adatbazisban
function updateProduct(data, callback){
    db.getConnection(function(err, connection) {
    if(data.skuChange == "true"){//true jon at ha volt sku csere. letezo sku-t csekkolni kell
        var sql = "SELECT * from `tbl_prods` where `product_sku` = ?";
        connection.query(sql, [data.prodSku], function(err, result) {
            if (result.length>0) {
                //console.log("benne van az sku");
                callback(null,"skuexists");
            }else{
                var sql = "SET @userid = '"+data.userId+"'; UPDATE tbl_prods SET `product_sku` = ?, `product_name` = ?, `quantity` = ?, `price`= ?, `comment`= ? where `product_id`= ?";
                connection.query(sql, [data.prodSku,data.prodName,data.prodQty,data.prodPrice,data.prodComment,data.prodId], function(err, result) {
                    if (err) {
                        //console.log(err);
                        callback(err, null);
                    } else 
                        callback(null, result);
                }); 
            }
        });
    }else{
    var sql = "SET @userid = '"+data.userId+"'; UPDATE tbl_prods SET `product_sku` = ?, `product_name` = ?, `quantity` = ?, `price`= ?, `comment`= ? where `product_id`= ?";
        connection.query(sql, [data.prodSku,data.prodName,data.prodQty,data.prodPrice,data.prodComment,data.prodId], function(err, result) {
            if (err) {
                //console.log(err);
                callback(err, null);
            } else 
                callback(null, result);
        });
    }
    connection.release();
});
}
