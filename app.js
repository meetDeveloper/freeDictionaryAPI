const express = require("express"),
    app = express(),
    cheerio = require("cheerio"),
    request = require('request'),
    path = require("path");

app.use(express.static('public'));

app.get("/", function(req, res) {
    
    const queriedWord = req.query.define,
          queriedLanguage = req.query.lang || 'en';
    
    if (!queriedWord) {
        res.sendFile(path.join(__dirname + '/views//index.html'));
    } else {
        console.log(queriedWord);

        if (encodeURIComponent(queriedWord).includes("%20") && queriedLanguage === 'en') {
            res.header("Access-Control-Allow-Origin", "*");

            return res.status(404).sendFile(path.join(__dirname + '/views/404.html'));
        }

        var url,
            replaceDefine = {
                hi: 'matlab',
                tr: 'nedir'
            };
            
        if (queriedLanguage !== 'en') {
            url = `https://www.google.co.in/search?hl=${ queriedLanguage }&q=${ replaceDefine[queriedLanguage] ? replaceDefine[queriedLanguage] : 'define' }+${ queriedWord }`;
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

                const $ = cheerio.load(body);

                var dictionary = {},
                    word = $("div.dDoNo span").first().text(),
                    meaning,
                    mainPart,
                    definitions;

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

                meaning = {},
                definitions = $(".lr_dct_ent.vmod.XpoqFe"),
                mainPart = definitions.first().find(".lr_dct_sf_h");


                    mainPart.each(function(i, element) {
                        
                        var type = $(this).find('i').text(),
                            selector = $(".lr_dct_sf_sens").eq(i).find("div[style='margin-left:20px'] > .PNlCoe");

                        meaning[type] = [];

                        selector.each(function(i, element) {
                            var newDefinition = {},
                                synonymsText,
                                synonyms,
                                example;

                            newDefinition.definition = $(this).find("div[data-dobid='dfn']").text();
                            example = $(this).find("span.vmod .vk_gy").text();
                            synonymsText = $(this).find("div.vmod td.lr_dct_nyms_ttl + td > span:not([data-log-string='synonyms-more-click'])").text();

                            synonyms = synonymsText.split(/,|;/).filter(synonym => synonym != ' ' && synonym).map(function(item) {
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
            
            url = `https://www.lexico.com/en/definition/${queriedWord}`;
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

                const $ = cheerio.load(body);

                if (!($(".hwg .hw").first()[0])) {
                    console.log($(".searchHeading").first().text());
                    console.log(queriedWord + " is not present in Dictionary.");
                    res.header("Access-Control-Allow-Origin", "*");
                    return res.status(404).sendFile(path.join(__dirname + '/views/404.html'));
                }


                var dictionary = [],
                    numberOfentryGroup,
                    arrayOfEntryGroup = [],
                    grambs = $("section.gramb"),
                    entryHead = $(".entryHead.primary_homograph");

                let i, j = 0;

                for (i = 0; i < entryHead.length; i++) {
                    arrayOfEntryGroup[i] = $("#" + entryHead[0].attribs.id + " ~ .gramb").length - $("#" + entryHead[i].attribs.id + " ~ .gramb").length;
                }
                arrayOfEntryGroup[i] = $("#" + entryHead[0].attribs.id + " ~ .gramb").length;

                numberOfentryGroup = arrayOfEntryGroup.length - 1;

                for (i = 0; i < numberOfentryGroup; i++) {

                    var entry = {},
                        word = $(".hwg .hw")[i].childNodes[0].nodeValue,
                        phonetic = $(".pronSection.etym .pron .phoneticspelling")[i],
                        pronunciation = $(".pronSection.etym .pron .pronunciations")[i],
                        origin = $(".pronSection.etym").eq(i).prev().find(".senseInnerWrapper p").text()

                    entry.word = word;

                    if (phonetic) {
                        entry.phonetic = phonetic.childNodes[0].data;
                    }
                    if (pronunciation) {
                        entry.pronunciation = $(pronunciation).find("a audio").attr("src");
                    }
                    
                    origin && (entry.origin = origin);
                    
                    entry.meaning = {};

                    let start = arrayOfEntryGroup[i],
                        end = arrayOfEntryGroup[i + 1];

                    for (j = start; j < end; j++) {

                        var partofspeech = $(grambs[j]).find(".ps.pos .pos").text();

                        $(grambs[j]).find(".semb").each(function(j, element) {

                            var meaningArray = [];

                            $(element).find("> li").each(function(j, element) {

                                var newDefinition = {},
                                    item = $(element).find("> .trg"),
                                    definition = $(item).find(" > p > .ind").text(),
                                    example = $(item).find(" > .exg  > .ex > em").first().text(),
                                    synonymsText = $(item).find(" > .synonyms > .exg  > div").first().text(),
                                    synonyms = synonymsText.split(/,|;/).filter(synonym => synonym != ' ' && synonym).map(function(item) {
                                        return item.trim();
                                    });

                                if (definition.length === 0) {
                                    definition = $(item).find(".crossReference").first().text();
                                }

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