//var socket = io.connect('http://localhost:8080');
var socket = io();
    socket.on('connect', function(data) {
        console.log("io connected");
    });
    

    socket.on('data', function(data) {
        //alert("socket adat");
        document.getElementById("infoDiv").classList.replace("enabled","disabled");
        document.getElementById("prodIdWeb").value=data.id;
        document.getElementById("prodSkuWeb").value=data.sku;
        document.getElementById("prodNameWeb").value=data.title;
        document.getElementById("prodImg").src=data.imgurl;
        //document.getElementById("produrl").href=data.permalink;
        document.getElementById("prodQtyWeb").value=data.qty;
        document.getElementById("prodPriceWeb").value=data.price;
        document.getElementById("prodSalePriceWeb").value=data.salePrice;
        document.getElementById("prodSaleWeb").innerHTML=data.totalSale;
        var k = document.getElementsByClassName("produrl");
        var i;
        for (i = 0; i < k.length; i++) {
        k[i].href=data.permalink;
        }
    });
    
    socket.on('extConnErr', function(data) {
        //alert("socket ERROR");
        document.getElementById("infoDiv").classList.replace("enabled","disabled");
        document.getElementById("alertDiv").classList.replace("disabled","enabled");
        document.getElementById("msg").innerHTML=data;
    });

    socket.on('disconnect', function(){
     console.log('user disconnected');
    });