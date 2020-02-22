const path = require("path"),
    express = require("express"),
    dictionary = require('./modules/dictionary.js');

const app = express();

app.use(express.static('public'));

app.get("/", function(req, res) {
    const word = req.query.define,
        language = req.query.lang || 'en';

    global.API_VERSION = (req.query.v && Number(req.query.v)) || 1;

    if (!word) {
        return res.redirect(301, 'https://dictionaryapi.dev');
        // return res.sendFile(path.join(__dirname + '/views/index.html'));
    }

    return dictionary.findDefinitions(word, language, (err, definitions) => {
        if (err) { return handleError(req, res, err); }

        res.header("Content-Type", 'application/json');
        res.header("Access-Control-Allow-Origin", "*");

        return res.send(JSON.stringify(definitions, null, 4));
    });
});

function handleError (req, res, err) {
    let { statusCode } = err;

    res.header("Access-Control-Allow-Origin", "*");

    return res.status(statusCode).sendFile(path.join(`${__dirname}/views/${statusCode}.html`));
}

app.listen(process.env.PORT, process.env.IP, function() {
    console.info("I am listening...");
});
