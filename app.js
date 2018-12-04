var   express = require("express"),
      app     = express(),
      cheerio = require("cheerio"),
      request = require('request'),
      path    = require("path");

const port = process.env.PORT || 3000;

app.use(express.static('public'));

app.get("/", function(req, res){
    
   if(!req.query.define){
       res.sendFile(path.join(__dirname+'/views//index.html'));
   }  else {
        if(encodeURIComponent(req.query.define).includes("%")){
                 console.log("yes");
                 res.header("Access-Control-Allow-Origin", "*");
                 return res.status(404).sendFile(path.join(__dirname+'/views/404.html'));
        }
        
        var url = 'https://en.oxforddictionaries.com/search?filter=noad&query=' + req.query.define;
        // if(req.query.lang){
        //   url =  url.replace('en', req.query.lang);
        //   if(req.query.lang === "hi"){
        //       url =  url.replace('define', 'matlab');
        //   }
        // }
        
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
            
            var $ = cheerio.load(body);

                    
                    
            if(!($(".hwg .hw").first()[0])){
                console.log($(".searchHeading").first().text());
                console.log(req.query.define + " is not present in Dictionary.");
                res.header("Access-Control-Allow-Origin", "*");
                return res.status(404).sendFile(path.join(__dirname+'/views/404.html'));
            }
            
            var word  = $(".hwg .hw").first()[0].childNodes[0].nodeValue;
            var dictionary = {};
            dictionary.word = word;
            
            dictionary.phonetic = $(".phoneticspelling").first().text();
            if(dictionary.phonetic.length < 1)
                dictionary.phonetic = undefined;

            dictionary.meaning = {};

            var i = 0;
            var grambs = $("section.gramb");

            var partBefore = ''
            var partofspeech = ''
            var definition = ''
            var k = 1
            for (i = 0; i < grambs.length; i++) {
                partBefore = partofspeech
                partofspeech = $(grambs[i]).find(".ps.pos .pos").text();
                if (partofspeech == '') partofspeech = $(grambs[i]).find(".domain_labels").text().trim();
                if (partofspeech == '' && partBefore != '') partofspeech = partBefore
                if (partofspeech == '') partofspeech = "main definition"                                
                if (partofspeech == partBefore) {
                    k = k + 1
                    partofspeech = partofspeech + k.toString()
                }else{
                    k = 1
                }
                
                $(grambs[i]).find(".semb").each(function (i, element) {
                    var meaningArray = [];
                    $(element).find("> li").each(function (i, element) {

                        var item = $(element).find("> .trg");

                        definition = $(item).find(" > p > .ind").text();
                        //if (definition == '') definition = $(grambs[0]).text();
                        if (definition == '') definition = $(item).find(".crossReference").text();

                        var example = $(item).find(" > .exg  > .ex > em").first().text();
                        var synonymsText = $(item).find(" > .synonyms > .exg  > .exs").first().text();
                        var synonyms = synonymsText.split(/,|;/).filter(synonym => synonym != ' ' && synonym).map(function (item) {
                            return item.trim();
                        });

                        var newDefinition = {};
                        if (definition.length > 0)
                            newDefinition.definition = definition;

                        if (example.length > 0)
                            newDefinition.example = example.substring(1, example.length - 1)

                        if (synonyms.length > 0)
                            newDefinition.synonyms = synonyms;

                        meaningArray.push(newDefinition);

                    })
                    if (definition =='') return
                    dictionary.meaning[partofspeech] = meaningArray.slice();
                })

            }
            
            Object.keys(dictionary).forEach(key => {(Array.isArray(dictionary[key]) && !dictionary[key].length) && delete dictionary[key]});
            
            if($(".hwg .hw").first()[0]){
                res.header("Content-Type",'application/json');
                res.header("Access-Control-Allow-Origin", "*");
                res.send(JSON.stringify(dictionary, null, 4));
            }
    
            
        });
    }
});


app.listen(port, process.env.IP, function(){
    console.log("I am listening on port: ", port);
});