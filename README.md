# Google Dictionary API

Google does not provide Google Dictionary API so I created one.

## Important Note
The API usage has been increasing radidly, and I am unable to keep up with the AWS bills due to this.
Kindly help me pay for the API so that I keep developing and able to give out this API for free.

[![paypal](https://www.paypalobjects.com/en_US/i/btn/btn_donateCC_LG.gif)](https://www.paypal.me/paytosuraj)

## Getting Started

### Usage 

The basic syntax of a URL request to the API is shown below:

https://api.dictionaryapi.dev/api/<--version-->/entries/<--language_code-->/<--word-->

As an example, to get definition of English word **hello** using _v2_, you can send request to

https://api.dictionaryapi.dev/api/v2/entries/en_US/hello, result returned will be,

```json
[
    {
        "word": "hello",
        "phonetics": [
            {
                "text": "/həˈloʊ/",
                "audio": "https://lex-audio.useremarkable.com/mp3/hello_us_1_rr.mp3"
            },
            {
                "text": "/hɛˈloʊ/",
                "audio": "https://lex-audio.useremarkable.com/mp3/hello_us_2_rr.mp3"
            }
        ],
        "meanings": [
            {
                "partOfSpeech": "exclamation",
                "definitions": [
                    {
                        "definition": "Used as a greeting or to begin a phone conversation.",
                        "example": "hello there, Katie!"
                    }
                ]
            },
            {
                "partOfSpeech": "noun",
                "definitions": [
                    {
                        "definition": "An utterance of “hello”; a greeting.",
                        "example": "she was getting polite nods and hellos from people",
                        "synonyms": [
                            "greeting",
                            "welcome",
                            "salutation",
                            "saluting",
                            "hailing",
                            "address",
                            "hello",
                            "hallo"
                        ]
                    }
                ]
            },
            {
                "partOfSpeech": "intransitive verb",
                "definitions": [
                    {
                        "definition": "Say or shout “hello”; greet someone.",
                        "example": "I pressed the phone button and helloed"
                    }
                ]
            }
        ]
    }
]
```

### Language support

The API supports multiple language, you can query any language supported by sending its language code.

For example you can get definition of French word **Bonjour** in _v2_ format by sending request to,

https://api.dictionaryapi.dev/api/v2/entries/fr/bonjour

```json
[
    {
        "word": "bonjour",
        "phonetics": [
            {}
        ],
        "meanings": [
            {
                "partOfSpeech": "nom masculin",
                "definitions": [
                    {
                        "definition": "Souhait de bonne journée (adressé en arrivant, en rencontrant).",
                        "synonyms": [
                            "salut"
                        ],
                        "antonyms": []
                    }
                ]
            }
        ]
    }
]
```


List of languages supported can be found [here](https://dictionaryapi.dev/languageCode.txt) for your reference.

### Regarding V1 Version
The API earlier use to send response as shown below, but this structure of response was found out to be difficult to work with (you can take a look at these tickets [#32](https://github.com/meetDeveloper/googleDictionaryAPI/issues/32) and [#4](https://github.com/meetDeveloper/googleDictionaryAPI/issues/4)), based on feedback in these tickets I have updated the API to _v2_ version. _v2_ version is available for all languages supported. That said, _v1_ version will always be supported for backward compatibility.

```json
[
    {
        "word": "hello",
        "phonetics": [
            {
                "text": "/həˈloʊ/",
                "audio": "https://lex-audio.useremarkable.com/mp3/hello_us_1_rr.mp3"
            },
            {
                "text": "/hɛˈloʊ/",
                "audio": "https://lex-audio.useremarkable.com/mp3/hello_us_2_rr.mp3"
            }
        ],
        "meaning": {
            "exclamation": [
                {
                    "definition": "Used as a greeting or to begin a phone conversation.",
                    "example": "hello there, Katie!"
                }
            ],
            "noun": [
                {
                    "definition": "An utterance of “hello”; a greeting.",
                    "example": "she was getting polite nods and hellos from people",
                    "synonyms": [
                        "greeting",
                        "welcome",
                        "salutation",
                        "saluting",
                        "hailing",
                        "address",
                        "hello",
                        "hallo"
                    ]
                }
            ],
            "intransitive verb": [
                {
                    "definition": "Say or shout “hello”; greet someone.",
                    "example": "I pressed the phone button and helloed"
                }
            ]
        }
    }
]
```

### Paths

| Location | Endpoint |
| :-- | :-- |
| Root path | `https://api.dictionaryapi.dev/api/<--version-->`|

### HTTP request and query methods

| Method | Endpoint | Description | Examples |
| :-- | :-- | :-- | :-- |
| `GET` | `/entries/<LANGUAGE>/<YOUR_WORD>`| Retrieves the Google Dictionary definition of the given word that has been entered instead of `<YOUR_WORD>` in the [provided language](https://dictionaryapi.dev/languageCode.txt) `<LANGUAGE>`. | [`/api/v2/entries/fr/bonjour`](https://api.dictionaryapi.dev/api/v2/entries/fr/bonjour) |

## Future plans  

You can see existing and add new feature proposals on the projects GitHub page.
Pull requests are welcome!

If you need any assistance or find any bugs, feel free to contact me directly via [email](mailto:srjjain1996@gmail.com) or [create a new issue](https://github.com/meetDeveloper/googleDictionaryAPI/issues) on the GitHub page.

## Support Us
This Dictionary API was initially created as an API that could be used by my friend for his project. I did not in my wildest dream thought that this API will become so popular, in few months this API took off and many people started to use it, initially I was able to manage the server costs but as number of requests started increasing, so did the server costs. Currently API has more than 10 million requests per month and to keep it running I need support of the community. I have planned few things in near future that will bring the cost down, but that will take some time. 

Kindly help me keep running and developing this API. Thanks a lot for using my API, it feels good when your creation help other create their own projects.

[![paypal](https://www.paypalobjects.com/en_US/i/btn/btn_donateCC_LG.gif)](https://www.paypal.me/paytosuraj)

## Related Projects

### [Dictionary Anywhere](https://github.com/meetDeveloper/Dictionary-Anywhere)

The **Dictionary Anywhere** extension helps you stay focused on what you are reading by eliminating the need to search for meaning, 
Double-clicking any word will view its definition in a small pop-up bubble. 
Now you never have to leave what you are reading to search for the meaning of the words you don't yet know.

Extension is available for [Google Chrome](https://chrome.google.com/webstore/detail/dictionary-anywhere/hcepmnlphdfefjddkgkblcjkbpbpemac/) and [Mozilla Firefox](https://addons.mozilla.org/en-US/firefox/addon/dictionary-anyvhere).
##### Enjoy Reading Uninterrupted!!!
