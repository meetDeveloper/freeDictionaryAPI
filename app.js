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
            
            var $ = cheerio.load(body);

                    
                    
            if(!($(".hwg .hw").first()[0])){
                console.log($(".searchHeading").first().text());
                console.log(req.query.define + " is not present in Dictionary.");
                res.header("Access-Control-Allow-Origin", "*");
                return res.status(404).sendFile(path.join(__dirname+'/views/404.html'));
            }
            
            
            var dictionary = [];

            var i,j = 0;

            var entryHead = $(".entryHead.primary_homograph");
            
            var array = [];
            var entriesOfFirstEntryHead = $("#" + entryHead[0].attribs.id + " ~ .gramb").length;
            //console.log(entriesOfFirstEntryHead);
            for(i = 0; i < entryHead.length; i++){
                array[i]  =   entriesOfFirstEntryHead - $("#" + entryHead[i].attribs.id + " ~ .gramb").length;
            }
            array[i] = entriesOfFirstEntryHead;
            //console.log(array);
            
            var grambs = $("section.gramb");

            var numberOfentryGroup = array.length - 1;

            for(i = 0; i < numberOfentryGroup; i++){
                var entry = {};
                
                var word  = $(".hwg .hw")[i].childNodes[0].nodeValue;
                entry.word = word;
                //console.log(entry.word);
                
                var phonetic  = $(".pronSection.etym .pron .phoneticspelling")[i];
                if(phonetic){
                    entry.phonetic = phonetic.childNodes[0].data;
                }
                
                entry.meaning = {};
                
                //var numberOfGrambs = array[i + 1] - array[i];
                var start  = array[i];
                var end = array[i + 1];

                for(j = start; j < end; j++){

                    	var partofspeech = $(grambs[j]).find(".ps.pos .pos").text();
                    	$(grambs[j]).find(".semb").each(function(j, element){
                    		var meaningArray = [];
                    		$(element).find("> li").each(function(j, element){
                    		    
                    			var item = $(element).find("> .trg");
                    			
                    			var definition = $(item).find(" > p > .ind").text();
                    			if(definition.length  === 0){
                    			    definition = $(item).find(".crossReference").first().text();
                    			}
                    			var example = $(item).find(" > .exg  > .ex > em").first().text();
                    			var synonymsText = $(item).find(" > .synonyms > .exg  > .exs").first().text();
                    			var synonyms = synonymsText.split(/,|;/).filter(synonym => synonym!= ' ' && synonym).map(function(item) {
                                                 return item.trim();
                                               });
                                               
                                var newDefinition = {};
                            	if(definition.length > 0)
                            	    newDefinition.definition = definition;
                            			                                   
                                if(example.length > 0)
                                    newDefinition.example = example.substring(1, example.length - 1);
                                
                                if(synonyms.length > 0)
                                    newDefinition.synonyms = synonyms;
    
                    			meaningArray.push(newDefinition);
    
                    		});

                    		if(partofspeech.length === 0)
                    		    partofspeech = "crossReference";
                    		    
                    		entry.meaning[partofspeech] = meaningArray.slice();
                    	});
                    		
                }
                dictionary.push(entry);
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


app.listen(process.env.PORT, process.env.IP, function(){
    console.log("I am listening...");
});
