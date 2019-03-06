# Google Dictionary API

Google does not provide API for Google Dictionary so I created one.

## Getting Started

To use, pass the query string with parameter `define` equal to the word you want to get the meaning of.

Eg. `/?define=hello`, will give you the Google dictionary definition of **hello**:

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


Optionally you can also send another parameter `lang` equal to code of the language in which the word appear.

Eg. `/?define=Bonjour&lang=fr`, will give you definition of **Bonjour** as present in French Dictionary.

```json
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
```


List of languages supported can be found [here](https://googledictionaryapi.eu-gb.mybluemix.net/languageCode.txt) for your reference.

### Paths

| Location | Endpoint |
| :-- | :-- |
| Root path | `https://googledictionaryapi.eu-gb.mybluemix.net`|
| Root path | `https://mydictionaryapi.appspot.com/`|

### HTTP request and query methods

| Method | Endpoint | Query | Description | Examples |
| :-- | :-- | :-- | :-- | :-- |
| `GET` | `/` | `?define=<YOUR_WORD>` | Retrieves the Google Dictionary definition of the given word that has been entered instead of `<YOUR_WORD>`. | [`?define=hello`](https://googledictionaryapi.eu-gb.mybluemix.net/?define=hello) |
| `GET` | `/` | `/?define=<YOUR_WORD>&lang=<LANGUAGE>` | Retrieves the Google Dictionary definition of the given word that has been entered instead of `<YOUR_WORD>` in the [provided language](https://googledictionaryapi.eu-gb.mybluemix.net/languageCode.txt) `<LANGUAGE>`. | [`/?define=Bonjour&lang=fr`](https://googledictionaryapi.eu-gb.mybluemix.net/?define=Bonjour&lang=fr) |

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
