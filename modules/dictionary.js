const request = require('request'),
    cheerio = require("cheerio"),
    puppeteer = require("puppeteer");

function transformDictionary (dictionary, callback) {
    /* global API_VERSION */
    if (API_VERSION !== 1) { return callback(undefined, dictionary); }

    return callback(undefined, dictionary.map((entry) => {
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
    }));
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

    return giveDOM(word, URI, 'en', (err, body) => {
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
    	
    	return callback(undefined, dictionary);
    });
}

function findNonEnglishDefinitions (word, language, callback) {
    let URI = `https://www.google.com/search?q=dictionary&hl=${language}#dobs=${word}`;
    
    if (language === 'fr') {
        URI = `https://www.google.com/search?q=définir+${word}&hl=${language}`; 
    }
    
    return giveDOM(word, URI, language, (err, body) => {
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
        			example = $(e).find(`${PARENT_SELECTOR} .vk_gy`).text().slice(1, -1);
        
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
        
        return transformDictionary(dictionary, callback);
    });
} 

function findDefinitions (word, language, callback) {
    if (language === 'en') { return findEnglishDefinitions(word, callback) }
    
    return findNonEnglishDefinitions(word, language, callback);
}


function giveDOM (word, url, language, callback) {
    if (language === 'fr' || language === 'en') { return useHTTPResponse(url, callback); }
    
    return usePuppeteer(word, url).then((body) => {
        return callback(undefined, body);
    }, () =>{
        return callback({
        	statusCode: 500,
        	title: 'Something Went Wrong.',
        	message: 'Sorry pal, Our servers ran into some problem.',
        	resolution: 'You can try the search again or head to the web instead.'
        });
    });
}

async function usePuppeteer (word, url) {
    const browser = await puppeteer.launch(),
        page = await browser.newPage();
        
    await page.goto(url);
    await page.waitForFunction((word) => { return document.querySelector('#dw-siw input').value === word; }, { timeout: 2000 }, word);

    let content = await page.content();
    
    await browser.close();
     
    return content;
}

function useHTTPResponse(url, callback) {
    request({
    	method: 'GET',
    	url: encodeURI(url),
    	headers: {
    		"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:58.0) Gecko/20100101 Firefox/58.0"
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

    	return callback (undefined, body);
    });
}

module.exports = {
    findDefinitions
};