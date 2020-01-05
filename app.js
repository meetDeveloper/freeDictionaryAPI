const express = require("express"),
    app = express(),
    cheerio = require("cheerio"),
    request = require('request'),
    path = require("path");

app.use(express.static('public'));

app.get("/", function(req, res) {
    
    const VERSION = req.query.v && Number(req.query.v),
          queriedWord = req.query.define,
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
                tr: 'nedir',
                fr: 'définir'
            };
            
        if (queriedLanguage !== 'en') {
            url = `https://www.google.com/search?hl=${ queriedLanguage }&q=${ replaceDefine[queriedLanguage] ? replaceDefine[queriedLanguage] : 'define' }+${ queriedWord }`;
            url = encodeURI(url);
            request({
                method: 'GET',
                url: url,
                headers: {
                    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/77.0.3865.120 Safari/537.36"
                }
            }, function(err, response, body) {

                if (err) { return console.error(err) }

                const $ = cheerio.load(body);

                let dictionary = [];
                
                if($(".lr_container").length === 0) {
                    console.log(queriedWord + " is not present in Dictionary.");
    
                    res.header("Access-Control-Allow-Origin", "*");
    
                    return res.status(404).sendFile(path.join(__dirname + '/views/404.html'));
                }
                
                $(".lr_container").find(".VpH2eb.vmod.XpoqFe").each((index, e) => {
                    let audio,
                        word,
                        phonetic,
                        origin,
                        meanings = [];
                
                    word = $(e).find(".WI9k4c").find("[data-dobid='hdw']").text();
                    phonetic = $(e).find(".WI9k4c").find(".S23sjd").text();
                    audio = $(e).find(".gycwpf.D5gqpe").find("source").attr('src');
                    origin = $(e).find("[jsname='Hqfs0d']").find("div div div").last().find('span').not(':has(sup)').text();

                    $(e).children(".vmod").children(".vmod").each((index, e) => {
                        let partOfSpeech,
                            definitions = [];
                
                        partOfSpeech = $(e).find(".vpx4Fd").find(".pgRvse.vdBwhd i").text();
                
                        $(e).find("div > ol").first().children("li").each((index, e) => {
                            let definition,
                                example,
                                synonyms = [],
                
                                PARENT_SELECTOR = '.thODed.Uekwlc.XpoqFe div[jsname="cJAsRb"] .QIclbb.XpoqFe';
                
                
                            definition = $(e).find(`${PARENT_SELECTOR} div[data-dobid='dfn']`).text();
                            if (queriedLanguage !== 'fr') {
                                example = $(e).find(`${PARENT_SELECTOR} .vk_gy`).text().slice(1, -1);
                            } else {
                                example = $(e).find(`${PARENT_SELECTOR} .vk_gy`).text();
                            }
                            
                            
                            $(e).find(`${PARENT_SELECTOR} > div.qFRZdb div.CqMNyc`).children("div[role='listitem']").each((index, e) => {
                                let synonym;
                
                                synonym = $(e).find(".lLE0jd.gWUzU.F5z5N").text();
                
                                synonyms.push(synonym);
                            });
                
                            definitions.push({
                                definition,
                                example,
                                synonyms
                            });
                        });
                
                        meanings.push({
                            partOfSpeech,
                            definitions
                        });
                    });

                    dictionary.push({
                        word,
                        phonetic,
                        audio,
                        origin,
                        meanings
                    });
                });
                
                if (!VERSION || VERSION === 0) {
                    dictionary = dictionary.map((entry) => {
                        let { meanings, ...otherProps } = entry;

                        meanings = meanings.reduce((meanings, meaning) => {
                            let partOfSpeech, rest;

                            ({partOfSpeech, ...rest} = meaning);
                            meanings[partOfSpeech] = rest;

                            return meanings;
                        }, {});
                    
                        return { ...otherProps, meaning: meanings };
                    });
                }

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
                        origin = $(".pronSection.etym").eq(i).prev().find(".senseInnerWrapper p").text();

                    entry.word = word;

                    if (phonetic) {
                        entry.phonetic = phonetic.childNodes[0] && phonetic.childNodes[0].data;
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
