var app = require("express")();
var cheerio = require("cheerio");
var request = require('request');
var path    = require("path");
var fs = require('fs');



app.get("/", function(req, res){
    
   if(!req.query.define){
       res.sendFile(path.join(__dirname+'/welcome.html'));
   }
   else{
        request({
        method: 'GET',
        url: 'https://www.google.co.in/search?q=define+' + req.query.define,
        headers: {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:58.0) Gecko/20100101 Firefox/58.0"
        }
    }, function(err, response, body) {
        
        if(err){
            return console.error(err)
        }
        
        var definition = {};
    
            
        var $ = cheerio.load(body);
        
             
             definition.word = req.query.define;
             
             var mainPart = $(".lr_dct_sf_h");
             
             mainPart.each(function(i, element){
                 var type = $(this).text();
                 definition[type] = [];
                 var selector = $(".lr_dct_sf_sens").eq(i).find("div[style='margin-left:20px'] > ._Jig:nth-of-type(1) > div[style='display:inline']");
                 selector.each(function(i, element){
                    definition[type].push($(this).text()); 
                 });
                 //console.log(selector.text());
             }) ;   
             
             res.header("Content-Type",'application/json');
              res.send(JSON.stringify(definition, null, 4));
     
                  //console.log(definition);
         });
   }
});



app.listen(process.env.PORT, process.env.IP, function(){
    console.log("I am listening...");
});