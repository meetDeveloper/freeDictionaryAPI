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
        

    
        //return res.send(body);
        var $ = cheerio.load(body);
        res.send(body);
            console.log($(".hwg .hw").first()[0]);
            var word  = $(".hwg .hw").first()[0].childNodes[0].nodeValue;
            console.log(word);
            if(word.length < 1){
                res.header("Access-Control-Allow-Origin", "*");
                return res.status(404).sendFile(path.join(__dirname+'/views/404.html'));
            }
            
            var dictionary = {};
            dictionary.word = word;
            dictionary.phonetic = $(".phoneticspelling").first().text();
            dictionary.meaning = {}

            var i,j = 0;

            var entryHead = $(".entryHead.primary_homograph");
            var array = [];
            for(i = 1; i < entryHead.length; i++){
                array[i - 1] = $("#" + entryHead[i - 1].attribs.id + " ~ .gramb").length - $("#" + entryHead[i].attribs.id + " ~ .gramb").length ;
            }
            array.push($("#" + entryHead[entryHead.length - 1].attribs.id + " ~ .gramb").length);     
            
            var grambs = $("section.gramb");
            
            for(i = 0; i < grambs.length; i++){
                	if(i + 1> array[j]){
                		break;
                	}
                	var partofspeech = $(grambs[i]).find(".ps.pos .pos").text();
                	$(grambs[i]).find(".semb").each(function(i, element){
                		var meaningArray = [];
                		$(element).find("> li").each(function(i, element){
                		    
                			var item = $(element).find("> .trg");
                			
                			var definition = $(item).find(" > p > .ind").text();
                			var example = $(item).find(" > .exg  > .ex > em").first().text();
                			var synonymsText = $(item).find(" > .synonyms > .exg  > .exs").first().text();
                			var synonyms = synonymsText.split(/,|;/).filter(synonym => synonym!= ' ' && synonym).map(function(item) {
                                             return item.trim();
                                           });
                                           
                            var newDefinition = {};
                        	if(definition.length > 0)
                        	    newDefinition.definition = definition;
                        			                                   
                            if(example.length > 0)
                                newDefinition.example = example.substring(1, example.length - 1)
                            
                            if(synonyms.length > 0)
                                newDefinition.synonyms = synonyms;

                			meaningArray.push(newDefinition);

                		})
                		dictionary.meaning[partofspeech] = meaningArray.slice();
                	})
                		
            }     
            
            Object.keys(dictionary).forEach(key => {(Array.isArray(dictionary[key]) && !dictionary[key].length) && delete dictionary[key]})
            res.header("Content-Type",'application/json');
            res.header("Access-Control-Allow-Origin", "*");
            res.send(JSON.stringify(dictionary, null, 4));

         });
   }
});


app.listen(process.env.PORT, process.env.IP, function(){
    console.log("I am listening...");
});
