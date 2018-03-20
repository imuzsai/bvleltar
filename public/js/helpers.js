function run(){
    document.getElementById("skuChange").value = "true";
}

function enableWebForm(){
 if(document.getElementById("checkWebEdit").checked){
    //bekapcsolni a webform inputokat
    document.getElementById("prodSkuWeb").disabled=false;
    document.getElementById("prodNameWeb").disabled=false;
    document.getElementById("prodQtyWeb").disabled=false;
    document.getElementById("prodPriceWeb").disabled=false;
    document.getElementById("prodSalePriceWeb").disabled=false;
    document.getElementById("checkWebEdit").value="1";
 }else{
     //kikapcsolni a webform inputokat
    document.getElementById("prodSkuWeb").disabled=true;
    document.getElementById("prodNameWeb").disabled=true;
    document.getElementById("prodQtyWeb").disabled=true;
    document.getElementById("prodPriceWeb").disabled=true;
    document.getElementById("prodSalePriceWeb").disabled=true;
 }
 
}

function enablePassForm(){
    if(document.getElementById("checkPassEdit").checked){
       //bekapcsolni a webform inputokat
       document.getElementById("password").disabled=false;
       document.getElementById("password2").disabled=false;
       document.getElementById("checkPassEdit").value="1";
    }else{
        //kikapcsolni a webform inputokat
       document.getElementById("password").disabled=true;
       document.getElementById("password2").disabled=true;
    }
    
   }

function confirmer(id){
 if(confirm('Biztosan törölni akarja a terméket?')){
     //REDIRECT
     window.location.href = ('/products/delete/'+id);
    }else{
        return false;
    }
};

function controlchat(){
    var chat = document.getElementById("chatdiv");
    if (chat.style.bottom == "-408px"){
        chat.style.bottom = "10px";
    }else {
        chat.style.bottom = "-408px";
    }
}