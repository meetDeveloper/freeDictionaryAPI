const // Versions
    V1 = 'v1',
    V2 = 'v2',

    SUPPORTED_VERSIONS = new Set([
        V1, 
        V2
    ]),

    SUPPORTED_LANGUAGES = new Set([
        'hi', 	 // Hindi
        'en',    // English (US)
        'en-uk', // English (UK)
        'es', 	 // Spanish
        'fr',	 // French
        'ja',    // Japanese
        'cs',    // Czech
        'nl',    // Dutch
        'sk',    // Slovak
        'ru',	 // Russian
        'de', 	 // German
        'it', 	 // Italian
        'ko',	 // Korean
        'pt-BR', // Brazilian Portuguese
        'ar',    // Arabic
        'tr'     // Turkish
    ]);

module.exports = {
    logEvent (word, language, message, additionalInfo = {}) {
        console.log({
            'Word': word,
            'Language': language,
            'Message': message,
            'AdditionalInfo': JSON.stringify(additionalInfo)
        });
    },

    isLanguageSupported (language) {
        return SUPPORTED_LANGUAGES.has(language);
    },

    isVersionSupported (version) {
        return SUPPORTED_VERSIONS.has(version);
    }
}