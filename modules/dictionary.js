const fs = require('fs'),
	_ = require('lodash'),
	https = require('https'),
	fetch = require('node-fetch'),

	utils = require('./utils.js'),
	errors = require('./errors.js'),

	httpsAgent = new https.Agent({ keepAlive: true }),

	ROOT_ENGLISH_WORDS = fs.readFileSync('./meta/rootEnglishWords.txt').toString().split("\n").map((word) => {
		return word.toLowerCase();
	}),
	DERIVED_ENGLISH_WORDS = fs.readFileSync('./meta/derivedEnglishWords.txt').toString().split("\n").map((word) => {
		return word.toLowerCase();
	}),

	ALL_ENGLISH_WORDS = new Set([...ROOT_ENGLISH_WORDS, ...DERIVED_ENGLISH_WORDS]);


function transformV2toV1 (data) {
	return data.map((entry) => {
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

function transform (data) {
	return data
	        .map(e => e.entry)
	        .filter(e => e)
			.reduce((accumulator, entry) => {
				if (!entry.subentries) { return accumulator.push(entry) && accumulator; }

				let { subentries } = entry,
					mappedSubentries;

				if (subentries.length > 1) {
					utils.logEvent(word, language, 'subentries length is greater than 1', { body });
				}

				if (entry.sense_families) {
					utils.logEvent(word, language, 'entry has subentries and sense families', { body });
				}

				if (entry.etymology) {
					utils.logEvent(word, language, 'entry has subentries and etymology', { body });
				}

				mappedSubentries = subentries
						.map((subentry) => {
							if (subentry.sense_families) {
								utils.logEvent(word, language, 'subentry has sense families', { body });
							}

							if (subentry.sense_family) {
								subentry.sense_families = [];
								subentry.sense_families.push(subentry.sense_family);
							}

							return _.defaults(subentry, _.pick(entry, ['phonetics', 'etymology']))
						})

				return accumulator.concat(mappedSubentries);
			}, [])
			.map((entry) => {
				let { headword, lemma, phonetics = [], etymology = {}, sense_families = [] } = entry;
				
				return {
					word: lemma || headword,
					phonetic: _.get(phonetics, '0.text'),
					phonetics: phonetics.map((e) => _.pick(e, ['text', 'oxford_audio'])),
					origin: _.get(etymology, 'etymology.text'),
					meanings: sense_families.map((sense_family) => {
						let { parts_of_speech, senses = []} = sense_family;

						// if parts of speech is empty at this level.
						// Current hypothesis tells that it means only one sense is present
						// We need to take out parts_of_speech from it and use it.
						if (!parts_of_speech) {
							parts_of_speech = _.get(senses[0], 'parts_of_speech', []);

							if (senses.length > 1) {
								utils.logEvent(word, language, 'part of speech missing but more than one sense present', { body });
							}
						}
						
						if (parts_of_speech.length > 1) {
							utils.logEvent(word, language, 'more than one part of speech present', { body });
						}

						return {
							partOfSpeech: _.get(parts_of_speech[0], 'value'),
							definitions: senses.map((sense) => {							
								let { definition = {}, example_groups = [], thesaurus_entries = [] } = sense;

								return {
									definition: definition.text,
									example: _.get(example_groups[0], 'examples.0'),
									synonyms: _.get(thesaurus_entries[0], 'synonyms.0.nyms', [])
										.map(e => e.nym),
									antonyms: _.get(thesaurus_entries[0], 'antonyms.0.nyms', [])
										.map(e => e.nym)
								}
							})
						};
					})
				};
			});
}

async function queryInternet (word, language) {
	let url = new URL('https://www.google.com/async/callback:5493');

	url.searchParams.set('fc', 'ErUBCndBTlVfTnFUN29LdXdNSlQ2VlZoWUIwWE1HaElOclFNU29TOFF4ZGxGbV9zbzA3YmQ2NnJyQXlHNVlrb3l3OXgtREpRbXpNZ0M1NWZPeFo4NjQyVlA3S2ZQOHpYa292MFBMaDQweGRNQjR4eTlld1E4bDlCbXFJMBIWU2JzSllkLVpHc3J5OVFPb3Q2aVlDZxoiQU9NWVJ3QmU2cHRlbjZEZmw5U0lXT1lOR3hsM2xBWGFldw');
	url.searchParams.set('fcv', '3');
	url.searchParams.set('async', `term:${encodeURIComponent(word)},corpus:${language},hhdr:true,hwdgt:true,wfp:true,ttl:,tsl:,ptl:`);

	url = url.toString();

	let response = await fetch(url, {
		agent: httpsAgent,
		headers: new fetch.Headers({
			"accept": "*/*",
			"accept-encoding": "gzip, deflate, br",
			"accept-language": "en-US,en;q=0.9",
			"user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/92.0.4515.107 Safari/537.36"
		})
	});

	if (response.status === 404) { throw new errors.NoDefinitionsFound({ reason: 'Website returned 404.'}); }

	if (response.status === 429) { throw new errors.RateLimitError(); }

	if (response.status !== 200) { throw new errors.NoDefinitionsFound({ reason: 'Threw non 200 status code.'}); }

	let body = await response.text(),
		data = JSON.parse(body.substring(4)),
		single_results = _.get(data, 'feature-callback.payload.single_results', []),
			error = _.chain(single_results)
					.find('widget')
					.get('widget.error')
					.value()

	if (single_results.length === 0) { throw new errors.NoDefinitionsFound({ word, language }); }

	if (error === 'TERM_NOT_FOUND_ERROR') { throw new errors.NoDefinitionsFound({ word, language }); }

	if (error) { throw new errors.UnexpectedError({ error }); }

	return single_results;
}

async function fetchFromSource (word, language) {
	let dictionaryData = await queryInternet(word, language);

	return dictionaryData;
}

async function findDefinitions (word, language) {
	if (language !== 'en') {
		let dictionaryData = await fetchFromSource(word, language);

		if (_.isEmpty(dictionaryData)) { throw new errors.UnexpectedError(); }

		return transform(dictionaryData);
	}

	if (!ALL_ENGLISH_WORDS.has(word)) {
		throw new errors.NoDefinitionsFound({
			word, 
			language, 
			reason: 'Word missing in dictionary.'
		})
	}

	let dictionaryData = await fetchFromSource(word, language);

	if (_.isEmpty(dictionaryData)) { throw new errors.UnexpectedError(); }

	return transform(dictionaryData);
}

module.exports = {
	findDefinitions,
	transformV2toV1
};
