var { check, validationResult, checkBody } = require('express-validator/check');
module.exports = {
    prodFormCheck: function(req,res,validator){
    //mezok sanitize es trim
    req.sanitize('prodSku').trim();
    req.sanitize('prodPrice').trim();
    req.sanitize('prodQty').trim();
    req.sanitize('prodSkuWeb').trim();
    req.sanitize('prodPriceWeb').trim();
    req.sanitize('prodQtyWeb').trim();
    req.sanitize('prodSalePriceWeb').trim();
    //ha a webadatok checkbox be volt jelölve akkor kell azokat a mezoket is ellenorizni
    //console.log(req.body);
    if(req.body.checkWebEdit){
        console.log("van webes adat");
        req.checkBody("prodSku","SKU hiba! BV-vel kezdődjön és számmal végződjön! (pl. BV45498)").matches('^BV[0-9]{0,10}$');
        req.checkBody("prodPrice","Az ár csak számot tartalmazhat!").isNumeric().isLength({ min: 1,max:8 });
        req.checkBody("prodQty","A mennyiség csak számot tartalmazhat!").isNumeric().isLength({ min: 1,max:5 });
        //webes formresz elllenorzese
        req.checkBody("prodSkuWeb","Web SKU hiba! BV-vel kezdődjön és számmal végződjön! (pl. BV45498)").matches('^BV[0-9]{0,10}$');
        req.checkBody("prodSkuWeb","A két cikkszám (SKU) nem egyforma!").matches(req.body.prodSku);
        req.checkBody("prodPriceWeb","Az Web ár csak számot tartalmazhat (min. 1, max 8 számjegy)!").isNumeric().isLength({ min: 1,max:8 });
        req.checkBody("prodQtyWeb","A Web mennyiség csak számot tartalmazhat (min. 1, max 3 számjegy)!").isNumeric().isLength({ min: 1, max:3 });
        if(req.body.prodSalePriceWeb){//ures is lehet ha nem allitunk be akcios arat
            console.log("ide kene esni");
            req.checkBody("prodSalePriceWeb","Az Web Akciós ár csak számot tartalmazhat (min. 1, max 8 számjegy)!").isNumeric().isLength({ min: 1,max:8 });
            req.checkBody("prodSalePriceWeb","Az Web Akciós ár alacsonyabb kell legyen, mint az Web ÁR!").isInt({ lt: req.body.prodPriceWeb});
        }
        var errors = req.validationErrors();
        return procerrors(errors);
    }
    else{
        console.log("nincs webes");
        req.checkBody("prodSku","SKU hiba! BV-vel kezdődjön és számmal végződjön! (pl. BV45498)").matches('^BV[0-9]{0,10}$');
        req.checkBody("prodPrice","Az ár csak számot tartalmazhat!").isNumeric().isLength({ min: 1,max:8 });
        req.checkBody("prodQty","A mennyiség csak számot tartalmazhat!").isNumeric().isLength({ min: 1,max:5 });
        var errors = req.validationErrors();
        return procerrors(errors);
    }
    //funkcio a hibak feldolgozasa es statusz kod visszaadasra
    function procerrors(errors){
        var errormsg =[];
        if (errors) {
            for(i=0;i<errors.length;i++){
                //errormsg += errors[i].msg+"<br/>";
                errormsg.push(errors[i].msg);
                //console.log(errors[i].msg);
            }
            return {
                status: 0,
                msg: errormsg
                };
        }
        else{
          return {
              status: 1,
              msg: errormsg
                };
        }
    }
    
},
loginFormCheck: function(req,res,validator){
    req.checkBody("username","A felhasználónév megadása kötelező!").exists();
    req.checkBody("password","A jelszó megadása kötelező!").exists();
    var errors = req.validationErrors();
    var errormsg =[];
    if (errors) {
        for(i=0;i<errors.length;i++){
            //errormsg += errors[i].msg+"<br/>";
            errormsg.push(errors[i].msg);
            console.log(errors[i].msg);
        }
        return {
            status: 0,
            msg: errormsg
            };
    }
    else{
      return {
          status: 1,
          msg: errormsg
            };
    }
},

signupFormCheck: function(req,res,validator){
    req.sanitize('username').trim();
    req.sanitize('password').trim();
    req.sanitize('password2').trim();
    //felh. nevre vonatkozo szabalyok/elvarasok
    req.checkBody("username", "A felhasználónév megadása kötelező!").exists();
    req.checkBody("username", "A felhasználónév nem tartalmazhat szóközt és/vagy speciális karaktert!").matches('^[a-zA-Z0-9]+$');
    req.checkBody("username", "A felhasználónév hossza min. 6, max. 15 karakter lehet!").isLength({ min: 6,max:15 });
    //a jelszóra(akra) vonatkozo szabalyok/elvarasok
    req.checkBody("password", "A jelszó megadása kötelező!").exists();
    req.checkBody("password2", "A jelszó-újra megadása kötelező!").exists();
    //req.checkBody("password", "A jelszó nem tartalmazhat szóközt!").matches('^[a-zA-Z0-9]+$');
    req.checkBody("password", "Jelszó min. 8 karakter (szóköz és ékezet nélkül), 1 szám, 1 speciális karakter (@#$%^&+-) !").isLength({ min: 8,max:15 }).matches('^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[@#$%^&+-])').matches('^[a-zA-Z0-9@#$%^&+-]+$');
    req.checkBody("password2", "Jelszó-újra min. 8 karakter (szóköz és ékezet nélkül), 1 szám, 1 speciális karakter (@#$%^&+-) !").isLength({ min: 8,max:15 }).matches('^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[@#$%^&+-])').matches('^[a-zA-Z0-9@#$%^&+-]+$');
    req.checkBody("password", "A jelszavak nem egyeznek!").equals(req.body.password2); //a ket jelszo egyforma?
            var errors = req.validationErrors();
            var errormsg =[];
            if (errors) {
                for(i=0;i<errors.length;i++){
                    //errormsg += errors[i].msg+"<br/>";
                    errormsg.push(errors[i].msg);
                    //console.log(errors[i].msg);
                }
                console.log("alma");
                return {
                    status: 1,
                    msg: errormsg
                    };
            }else{
                console.log("ide is2");
              return {
                  status: 0,
                  msg: errormsg
                    };
            }
},

userEditFormCheck: function(req,res,validator){
    //ha volt jelszomodositas akkor vizsgaljuk csak a mezoket
    if(req.body.checkPassEdit){
    req.sanitize('password').trim();
    req.sanitize('password2').trim();
    req.checkBody("password", "Jelszó min. 8 karakter (szóköz és ékezet nélkül), 1 szám, 1 speciális karakter (@#$%^&+-) !").isLength({ min: 8,max:15 }).matches('^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[@#$%^&+-])').matches('^[a-zA-Z0-9@#$%^&+-]+$');
    req.checkBody("password2", "Jelszó-újra min. 8 karakter (szóköz és ékezet nélkül), 1 szám, 1 speciális karakter (@#$%^&+-) !").isLength({ min: 8,max:15 }).matches('^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[@#$%^&+-])').matches('^[a-zA-Z0-9@#$%^&+-]+$');
    req.checkBody("password", "A jelszavak nem egyeznek!").equals(req.body.password2); //a ket jelszo egyforma?
    }
            var errors = req.validationErrors();
            var errormsg =[];
            if (errors) {
                for(i=0;i<errors.length;i++){
                    //errormsg += errors[i].msg+"<br/>";
                    errormsg.push(errors[i].msg);
                    //console.log(errors[i].msg);
                }
                console.log("alma");
                return {
                    status: 1,
                    msg: errormsg
                    };
            }else{
                console.log("ide is2");
              return {
                  status: 0,
                  msg: errormsg
                    };
            }
},

eventsFilterFormCheck: function(req,res,validator){
    req.sanitize('productIdInput').trim();
    //a product id opcionalis mezo, csak akkor ellenorizzuk ha meg van adva
    req.checkQuery("productIdInput","A termékID csak számot tartalmazhat").optional({ checkFalsy: true }).isInt();

    var errors = req.validationErrors();
    var errormsg =[];
    if (errors) {
        for(i=0;i<errors.length;i++){
            //errormsg += errors[i].msg+"<br/>";
            errormsg.push(errors[i].msg);
            console.log(errors[i].msg);
        }
        return {
            status: 0,
            msg: errormsg
            };
    }
    else{
      return {
          status: 1,
          msg: errormsg
            };
    }
},
searchFormCheck: function(req,res,validator){
    req.sanitize('keresSzoveg').trim();
    req.checkQuery("keresSzoveg","Add meg a keresendő kifejezést!").exists();
    req.checkQuery("keresSzoveg","Minimum 3 maximum 100 karakter!").isLength({ min: 3,max:100 });
    var errors = req.validationErrors();
    var errormsg =[];
    if (errors) {
        for(i=0;i<errors.length;i++){
            //errormsg += errors[i].msg+"<br/>";
            errormsg.push(errors[i].msg);
            console.log(errors[i].msg);
        }
        return {
            status: 0,
            msg: errormsg
            };
    }
    else{
      return {
          status: 1,
          msg: errormsg
            };
    }
},



//ez az export vege
}