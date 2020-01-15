const request = require('request'),
    cheerio = require("cheerio"),
    jsdom = require("jsdom");


function transformDictionary (dictionary, callback) {
    /* global API_VERSION */
    if (API_VERSION !== 1) { return dictionary; }

    return dictionary.map((entry) => {
    	let {
    		meanings,
    		...otherProps
    	} = entry;
    
    	meanings = meanings.reduce((meanings, meaning) => {
    		let partOfSpeech, rest;
    
    		({
    			partOfSpeech,
    			...rest
    		} = meaning);
    		meanings[partOfSpeech] = rest;
    
    		return meanings;
    	}, {});
    
    	return {
    		...otherProps,
    		meaning: meanings
    	};
    });
}

function findEnglishDefinitions (word, callback) {
    if (encodeURIComponent(word).includes('%20%20')) {
        return callback({
        	statusCode: 404,
        	title: 'Word not found',
        	message: 'Sorry pal, we couldn\'t find definitions for the word you were looking for.',
        	resolution: 'You can try the search again or head to the web instead.'
        });
    }
    
    const URI = `https://www.lexico.com/en/definition/${word}`;

    return giveBody(URI, (err, body) => {
        if (err) { return callback(err); }
        
        const $ = cheerio.load(body);
    
    	if (!($(".hwg .hw").first()[0])) {
            return callback({
        		statusCode: 404,
        		title: 'Word not found',
        		message: 'Sorry pal, we couldn\'t find definitions for the word you were looking for.',
        		resolution: 'You can try the search again or head to the web instead.'
        	});
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
    	
    	return callback(null, dictionary);
    });
}

function findNonEnglishDefinitions (word, language, callback) {
    let URI = `https://www.google.com/async/dictw?hl=${language}&async=term:${word},corpus:${language},hhdr:false,hwdgt:true,wfp:true,xpnd:true,ttl:,tsl:${language},_id:dictionary-modules,_pms:s,_jsfs:Ffpdje,_fmt:pc`;
    
    return giveBody(URI, { cleanBody: true }, (err, body) => {
        if (err) { return callback(err); }

        const $ = cheerio.load(body);
        
        if ($(".lr_container").length === 0 || $("[data-dobid='hdw']").length === 0) {
        	return callback({
        		statusCode: 404,
        		title: 'Word not found',
        		message: 'Sorry pal, we couldn\'t find definitions for the word you were looking for.',
        		resolution: 'You can try the search again or head to the web instead.'
        	});
        }
        
        let dictionary = [];
        
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
        			example = $(e).find(`${PARENT_SELECTOR} .vk_gy`).text();
                    
                    // In french language example are not wrapped around quotes.
                    example[0] === '"' && (example = example.slice(1, -1));

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
        
        return callback(null, transformDictionary(dictionary));
    });
} 

function findDefinitions (word, language, callback) {
    if (language === 'en') { return findEnglishDefinitions(word, callback); }
    
    return findNonEnglishDefinitions(word, language, callback);
}


function giveBody (url, options, callback) {
    !callback && (callback = options) && (options = {});

    return fetchData(url, function (err, body) {
        if (err) { return callback(err) }
        
        try {
            options.cleanBody && (body = cleanBody(body));
        } catch (e) {
            return callback({
            	statusCode: 500,
            	title: 'Something Went Wrong.',
            	message: 'Sorry pal, Our servers ran into some problem.',
            	resolution: 'You can try the search again or head to the web instead.'
            });
        }

        return callback(null, body);
    });
}

function cleanBody (body) {
    const { JSDOM } = jsdom;

    let c = '',
        d = 0,
        e = 0,
        arr = [];
    
    body = body.split('\n');
    body.shift();
    body = body.join('\n');

    for (c = c ? c : c + body; c; ) {
        d = 1 + c.indexOf(';');
        
        if (!d) { break; }
        
        e = d + parseInt(c, 16);
        
        arr.push(c.substring(d, e));
        
        c = c.substring(e);
        d = 0;
    }
    
    arr = arr.filter((e) => (e.indexOf('[') !== 0));

    arr[1] = '<script>';
    arr[arr.length] = '</script>';

    return new JSDOM(arr.join(''), { runScripts: "dangerously" }).serialize();
}

function fetchData(url, callback) {
    request({
    	method: 'GET',
    	url: encodeURI(url),
    	headers: {
    		"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/79.0.3945.117 Safari/537.36"
    	}
    }, (err, response, body) => {
    	if (err) {
    	    return callback({
            	statusCode: 500,
            	title: 'Something Went Wrong.',
            	message: 'Sorry pal, Our servers ran into some problem.',
            	resolution: 'You can try the search again or head to the web instead.'
            });
    	}

    	return callback (null, body);
    });
}

module.exports = {
    findDefinitions
};