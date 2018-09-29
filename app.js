var   express = require("express"),
      app     = express(),
      cheerio = require("cheerio"),
      request = require('request'),
      path    = require("path");

app.use(express.static('public'));

app.get("/", function(req, res){
    
   if(!req.query.define){
       res.sendFile(path.join(__dirname+'/views//index.html'));
   }  else {
        
        var url = 'https://www.google.co.in/search?hl=en&q=define+' + req.query.define;
        if(req.query.lang){
           url =  url.replace('en', req.query.lang);
           if(req.query.lang === "hi"){
               url =  url.replace('define', 'matlab');
           }
        }
        
        url = encodeURI(url);

        request({
        method: 'GET',
        url: url,
        headers: {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:58.0) Gecko/20100101 Firefox/58.0"
        }
    }, function(err, response, body) {
        
        if(err){
            return console.error(err);
        }
        
        var dictionary = {};
    
             
        var $ = cheerio.load(body);
        

             var word  = $("div.dDoNo span").first().text();
             
             if(word.length < 1){
                 res.header("Access-Control-Allow-Origin", "*");
                 return res.status(404).sendFile(path.join(__dirname+'/views/404.html'));
             }
             
             dictionary.word = $("div.dDoNo span").first().text();

             if(!$('.lr_dct_spkr.lr_dct_spkr_off audio')){
                    dictionary.pronunciation = "https:" + $('.lr_dct_spkr.lr_dct_spkr_off audio')[0].attribs.src;
                    dictionary.pronunciation = dictionary.pronunciation.replace('--_gb', '--_us');
             }
             
             dictionary.phonetic = [];
             $(".lr_dct_ph.XpoqFe").first().find('span').each(function(i, element){
                dictionary.phonetic.push($(this).text()); 
             });
             
             dictionary.meaning = {};


             var definitions = $(".lr_dct_ent.vmod.XpoqFe");
             
             var mainPart = definitions.first().find(".lr_dct_sf_h");
             
             var meaning = {};
             
             mainPart.each(function(i, element){
                 var type = $(this).find('i').text();
                 meaning[type] = [];
                 var selector = $(".lr_dct_sf_sens").eq(i).find("div[style='margin-left:20px'] > .PNlCoe");
                 
                 selector.each(function(i, element){
                    var newDefinition = {};
                    newDefinition.definition = $(this).find("div[data-dobid='dfn']").text();
                    var example  = $(this).find("span.vmod .vk_gy").text();
                    var synonymsText = $(this).find("div.vmod td.lr_dct_nyms_ttl + td > span:not([data-log-string='synonyms-more-click'])").text();
                
                    var synonyms = synonymsText.split(/,|;/).filter(synonym => synonym!= ' ' && synonym).map(function(item) {
                                        return item.trim();
                                   });
                                   
                    if(example.length > 0)
                        newDefinition.example = example.replace(/(^")|("$)/g, '');  
                    
                    if(synonyms.length > 0)
                        newDefinition.synonyms = synonyms;
                    
                    meaning[type].push(newDefinition); 
                 });

             }) ;   
             
             dictionary.meaning = meaning;
             
             Object.keys(dictionary).forEach(key => {(Array.isArray(dictionary[key]) && !dictionary[key].length) && delete dictionary[key]})

             res.header("Content-Type",'application/json');
             res.header("Access-Control-Allow-Origin", "*");
             res.send(JSON.stringify(dictionary, null, 4));

         });
   }
});

// app.get("/languageCode.txt", function(req, res){
//     res.sendFile(__dirname + "/languageCode.txt");
// })

app.listen(process.env.PORT, process.env.IP, function(){
    console.log("I am listening...");
});
