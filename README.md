# Google Dictionary API

Google does not provide API for Google Dictionary so I created one.

## Getting Started

### Usage 

The basic syntax of a URL request to the API is shown below:

https://api.dictionaryapi.dev/api/v1/entries/<--language_code-->/<--word-->

As an example, to get definition of English word **hello**, you can send request to

https://api.dictionaryapi.dev/api/v1/entries/en/hello, result returned will be,

```json
[
  {
    "word": "hello",
    "phonetic": [
      "həˈləʊ",
      "hɛˈləʊ"
    ],
    "meaning": {
      "exclamation": [
        {
          "definition": "used as a greeting or to begin a telephone conversation.",
          "example": "hello there, Katie!"
        }
      ],
      "noun": [
        {
          "definition": "an utterance of ‘hello’; a greeting.",
          "example": "she was getting polite nods and hellos from people"
        }
      ],
      "verb": [
        {
          "definition": "say or shout ‘hello’.",
          "example": "I pressed the phone button and helloed"
        }
      ]
    }
  }
]
```

### Language support

The API supports multiple language, you can query any language supported by sending its language code.

For example you can get definition of French word **Bonjour** by sending request to,

https://api.dictionaryapi.dev/api/v1/entries/fr/bonjour

```json
[
  {
    "word": "bonjour",
    "meaning": {
      "nom_masculin": [
        {
          "definition": "Souhait de bonne journée (adressé en arrivant, en rencontrant).",
          "synonyms": [
            "salut"
          ]
        }
      ]
    }
  }
]
```


List of languages supported can be found [here](https://dictionaryapi.dev/languageCode.txt) for your reference.

### Paths

| Location | Endpoint |
| :-- | :-- |
| Root path | `https://api.dictionaryapi.dev/`|

### HTTP request and query methods

| Method | Endpoint | Description | Examples |
| :-- | :-- | :-- | :-- |
| `GET` | `/api/v1/entries/<LANGUAGE>/<YOUR_WORD>`| Retrieves the Google Dictionary definition of the given word that has been entered instead of `<YOUR_WORD>` in the [provided language](https://dictionaryapi.dev/languageCode.txt) `<LANGUAGE>`. | [`/api/v1/entries/fr/bonjour`](https://api.dictionaryapi.dev/api/v1/entries/fr/bonjour) |

## Future plans  

You can see existing and add new feature proposals on the projects GitHub page.
Pull requests are welcome!

## Support  

If you need any assistance or find any bugs, feel free to contact me directly via [email](mailto:srjjain1996@gmail.com) or [create a new issue](https://github.com/meetDeveloper/googleDictionaryAPI/issues) on the GitHub page.

## Related Projects

### [Dictionary Anywhere](https://github.com/meetDeveloper/Dictionary-Anywhere)

The **Dictionary Anywhere** extension helps you stay focused on what you are reading by eliminating the need to search for meaning, 
Double-clicking any word will view its definition in a small pop-up bubble. 
Now you never have to leave what you are reading to search for the meaning of the words you don't yet know.

Extension is available for [Google Chrome](https://chrome.google.com/webstore/detail/dictionary-anywhere/hcepmnlphdfefjddkgkblcjkbpbpemac/) and [Mozilla Firefox](https://addons.mozilla.org/en-US/firefox/addon/dictionary-anyvhere).
##### Enjoy Reading Uninterrupted!!!
