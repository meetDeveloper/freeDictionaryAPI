const // Versions
    V1 = 'v1',
    V2 = 'v2',

    SUPPORTED_VERSIONS = [
        V1, 
        V2
    ],

    SUPPORTED_LANGUAGES = [
        'hi', 	 // Hindi
        'en', 	 // English (US)
        'en_US', // English (US)
        'en_GB', // English (UK)
        'es', 	 // Spanish
        'fr',	 // French
        'ja',    // Japanese
        'ru',	 // Russian
        'de', 	 // German
        'it', 	 // Italian
        'ko',	 // Korean
        'pt-BR', // Brazilian Portuguese
        'ar',    // Arabic
        'tr'     // Turkish
    ];

module.exports = {
    logEvent (word, language, message, additionalInfo = {}) {
        console.log({
            'Word': word,
            'Language': language,
            'Message': message,
            'AdditionalInfo': JSON.stringify(additionalInfo)
        });
    }
}