const { JSDOM } = require('jsdom'),
    express = require('express'),
    rateLimit = require("express-rate-limit"),

    utils = require('./modules/utils.js'),
    errors = require('./modules/errors.js'),
    dictionary = require('./modules/dictionary.js'),

    // HTML Parser
    { DOMParser } = new JSDOM().window,
    parser = new DOMParser(),

    app = express(),
    limiter = rateLimit({
        windowMs: 5 * 60 * 1000, // 5 minutes
        max: 450 // limit each IP to 450 requests per windowMs
    }),

    // Versions
    V1 = 'v1',
    V2 = 'v2',

    // Status Codes
    REQUEST_TYPE_STATUS_CODE = {
        notFound: 404,
        rateLimit: 429,
        serverError: 500
    },

    // Headers
    HEADER_CONTENT_TYPE = 'Content-Type',
    HEADER_ACCESS_CONTROL_ALLOW_ORIGIN = 'Access-Control-Allow-Origin';

// GLOBALS
global._ = require('lodash');

function cleanText (text) {
    if (!text) { return text; }

    return parser
        .parseFromString(text, "text/html")
        .body.textContent;
}


function handleError (error = {}) {
    // Using duck typing to know if we explicitly threw this error
    // If not then wrapping original error into UnexpectedError
    if (!error.requestType) { error = new errors.UnexpectedError({ original_error: error }); }

    const { requestType, title, message, resolution } = error;
        status = REQUEST_TYPE_STATUS_CODE[requestType],
        body = JSON.stringify({
            title,
            message,
            resolution
        });

    this.set(HEADER_CONTENT_TYPE, 'application/json');
    this.set(HEADER_ACCESS_CONTROL_ALLOW_ORIGIN, '*');

    return this.status(status).send(body);
};

app.set('trust proxy', true);

app.use(limiter);

app.get('/api/:version/entries/:language/:word', async (req, res) => {
    let { word, language, version } = req.params,
        include = _.reduce(_.get(req.query, 'include', '').split(','), (accumulator, current) => {
            accumulator[current] = true;

            return accumulator;
        }, {});

    word = decodeURIComponent(word);

    if (!word || !language || !version) {
        return handleError.call(res, new errors.NoDefinitionsFound()); 
    }

    // @todo: Find better error.
    if (!utils.isVersionSupported(version)) { return handleError.call(res, new errors.NoDefinitionsFound()); }

    // Todo: Figure out better strategy.
    if (language === 'en_US' || language === 'en_GB') { language = 'en'; }

    // By default we are assuming person means American English
    // This is needed for backward compatibility.
    language = language.toLowerCase();

    // @todo: Find better error.
    if (!utils.isLanguageSupported(language)) { return handleError.call(res, new errors.NoDefinitionsFound()); }

    word = word.trim().toLocaleLowerCase(language);

    try {
        let definitions = await dictionary.findDefinitions(word, language, { include }),
            status = 200,
            body;

        if (version === V1) {
            definitions = dictionary.transformV2toV1(definitions);
        }

        body = JSON.stringify(definitions, (key, value) => {
            if (typeof value === 'object') { return value; }

            return cleanText(value);
        });

        res.set(HEADER_CONTENT_TYPE, 'application/json');
        res.set(HEADER_ACCESS_CONTROL_ALLOW_ORIGIN, '*');

        return res.status(status).send(body);
    } catch (error) {
        return handleError.call(res, error);
    }
});

app.listen(3000, () => console.log('Server running on port 3000'));
