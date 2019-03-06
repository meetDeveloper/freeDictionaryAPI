var express = require("express"),
    app = express(),
    cheerio = require("cheerio"),
    request = require('request'),
    path = require("path");

app.use(express.static('public'));

app.get("/", function(req, res) {

    if (!req.query.define) {
        res.sendFile(path.join(__dirname + '/views//index.html'));
    } else {
        if (encodeURIComponent(req.query.define).includes("%")) {
            res.header("Access-Control-Allow-Origin", "*");

            return res.status(404).sendFile(path.join(__dirname + '/views/404.html'));
        }
        
        var url;
        
        if (req.query.lang !== 'en') {
            url = `https://www.google.co.in/search?hl=${ req.query.lang }&q=${ req.query.lang !== 'hi' ? 'define' : 'matlab' }+${ req.query.define }`;
            url = encodeURI(url);
            
            request({
                method: 'GET',
                url: url,
                headers: {
                    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:58.0) Gecko/20100101 Firefox/58.0"
                }
            }, function(err, response, body) {
    
                if (err) {
                    return console.error(err);
                }
    
                var dictionary = {},
                 $ = cheerio.load(body),
                 word = $("div.dDoNo span").first().text();

                if (word.length < 1) {
                    res.header("Access-Control-Allow-Origin", "*");
                    return res.status(404).sendFile(path.join(__dirname + '/views/404.html'));
                }
    
                dictionary.word = $("div.dDoNo span").first().text();
    
                if (!$('.lr_dct_spkr.lr_dct_spkr_off audio')) {
                    dictionary.pronunciation = "https:" + $('.lr_dct_spkr.lr_dct_spkr_off audio')[0].attribs.src;
                    dictionary.pronunciation = dictionary.pronunciation.replace('--_gb', '--_us');
                }
    
                dictionary.phonetic = [];
                $(".lr_dct_ph.XpoqFe").first().find('span').each(function(i, element) {
                    dictionary.phonetic.push($(this).text());
                });
    
                dictionary.meaning = {};
    
    
                var definitions = $(".lr_dct_ent.vmod.XpoqFe");
    
                var mainPart = definitions.first().find(".lr_dct_sf_h");
    
                var meaning = {};
    
                mainPart.each(function(i, element) {
                    var type = $(this).find('i').text();
                    meaning[type] = [];
                    var selector = $(".lr_dct_sf_sens").eq(i).find("div[style='margin-left:20px'] > .PNlCoe");
    
                    selector.each(function(i, element) {
                        var newDefinition = {};
                        newDefinition.definition = $(this).find("div[data-dobid='dfn']").text();
                        var example = $(this).find("span.vmod .vk_gy").text();
                        var synonymsText = $(this).find("div.vmod td.lr_dct_nyms_ttl + td > span:not([data-log-string='synonyms-more-click'])").text();
    
                        var synonyms = synonymsText.split(/,|;/).filter(synonym => synonym != ' ' && synonym).map(function(item) {
                            return item.trim();
                        });
    
                        if (example.length > 0)
                            newDefinition.example = example.replace(/(^")|("$)/g, '');
    
                        if (synonyms.length > 0)
                            newDefinition.synonyms = synonyms;
    
                        meaning[type].push(newDefinition);
                    });
    
                });
    
                dictionary.meaning = meaning;
    
                Object.keys(dictionary).forEach(key => {
                    (Array.isArray(dictionary[key]) && !dictionary[key].length) && delete dictionary[key];
                });
    
                res.header("Content-Type", 'application/json');
                res.header("Access-Control-Allow-Origin", "*");
                res.send(JSON.stringify(dictionary, null, 4));
            });
        } else {
            url = `https://en.oxforddictionaries.com/search?filter=noad&query=${req.query.define}`;
            url = encodeURI(url);
            
            request({
                method: 'GET',
                url: url,
                headers: {
                    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:58.0) Gecko/20100101 Firefox/58.0"
                }
            }, function(err, response, body) {
            
                if (err) {
                    return console.error(err);
                }
            
                var $ = cheerio.load(body);
            
            
            
                if (!($(".hwg .hw").first()[0])) {
                    console.log($(".searchHeading").first().text());
                    console.log(req.query.define + " is not present in Dictionary.");
                    res.header("Access-Control-Allow-Origin", "*");
                    return res.status(404).sendFile(path.join(__dirname + '/views/404.html'));
                }
            
            
                var dictionary = [];
            
                var i, j = 0;
            
                var entryHead = $(".entryHead.primary_homograph");
            
                var array = [];
                var entriesOfFirstEntryHead = $("#" + entryHead[0].attribs.id + " ~ .gramb").length;
                
                for (i = 0; i < entryHead.length; i++) {
                    array[i] = entriesOfFirstEntryHead - $("#" + entryHead[i].attribs.id + " ~ .gramb").length;
                }
                array[i] = entriesOfFirstEntryHead;

                var grambs = $("section.gramb");
            
                var numberOfentryGroup = array.length - 1;
            
                for (i = 0; i < numberOfentryGroup; i++) {
                    var entry = {};
            
                    var word = $(".hwg .hw")[i].childNodes[0].nodeValue;
                    entry.word = word;

                    var phonetic = $(".pronSection.etym .pron .phoneticspelling")[i],
                        pronunciation = $(".pronSection.etym .pron .pronunciations")[i];
                    if (phonetic) {
                        entry.phonetic = phonetic.childNodes[0].data;
                    }
                    if (pronunciation){
                        entry.pronunciation = $(pronunciation).find("a audio").attr("src");
                    }
            
                    entry.meaning = {};
            
                    var start = array[i];
                    var end = array[i + 1];
            
                    for (j = start; j < end; j++) {
            
                        var partofspeech = $(grambs[j]).find(".ps.pos .pos").text();
                        $(grambs[j]).find(".semb").each(function(j, element) {
                            var meaningArray = [];
                            $(element).find("> li").each(function(j, element) {
            
                                var item = $(element).find("> .trg");
            
                                var definition = $(item).find(" > p > .ind").text();
                                if (definition.length === 0) {
                                    definition = $(item).find(".crossReference").first().text();
                                }
                                var example = $(item).find(" > .exg  > .ex > em").first().text();
                                var synonymsText = $(item).find(" > .synonyms > .exg  > .exs").first().text();
                                var synonyms = synonymsText.split(/,|;/).filter(synonym => synonym != ' ' && synonym).map(function(item) {
                                    return item.trim();
                                });
            
                                var newDefinition = {};
                                if (definition.length > 0)
                                    newDefinition.definition = definition;
            
                                if (example.length > 0)
                                    newDefinition.example = example.substring(1, example.length - 1);
            
                                if (synonyms.length > 0)
                                    newDefinition.synonyms = synonyms;
            
                                meaningArray.push(newDefinition);
            
                            });
            
                            if (partofspeech.length === 0)
                                partofspeech = "crossReference";
            
                            entry.meaning[partofspeech] = meaningArray.slice();
                        });
            
                    }
                    dictionary.push(entry);
                }
    
                Object.keys(dictionary).forEach(key => {
                    (Array.isArray(dictionary[key]) && !dictionary[key].length) && delete dictionary[key];
                });
            
                if ($(".hwg .hw").first()[0]) {
                    res.header("Content-Type", 'application/json');
                    res.header("Access-Control-Allow-Origin", "*");
                    res.send(JSON.stringify(dictionary, null, 4));
                }
            });
        }
    }
});

app.listen(process.env.PORT, process.env.IP, function() {
    console.log("I am listening...");
});