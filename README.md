# files-provider

<a href="https://www.patreon.com/bePatron?u=8663953"><img alt="become a patron" src="https://c5.patreon.com/external/logo/become_a_patron_button.png" height="35px"></a>

Provides apps with file(s) identified via a regex.

```js
const opener = require('opener')
const { HANDLE, PROMPT_AND_HANDLE, createFilesProvider } = require('files-provider')

const provideFiles = createFilesProvider({
    single       : HANDLE
  , multi        : PROMPT_AND_HANDLE
  , promptHeader : 'Example Tool - please select a file to open: '
  , regex        : /\.js$/
  , handler      : ({ entry, fullPath }) => {
      console.error('Opening %s', entry)
      opener(`file://${fullPath}`)
  }
})

;(async () => {
  try {
    await provideFiles.fromDirectory(__dirname)
  } catch (err) {
    console.error(err)
  }
})()
```

## Installation

    npm install files-provider

## [API](https://thlorenz.github.io/files-provider)

<!-- Generated by documentation.js. Update this documentation by updating the source code. -->

### FilesProvider.fromDirectory

Returns or handles matched files from the given directory.

**Parameters**

-   `root` **[String](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)?** directory to open files from (defaults to working directory) (optional, default `process.cwd()`)

Returns **[Array](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array)&lt;[Object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object)>** files if `RETURN` is the selected strategy

### createFilesProvider

Creates a FilesProvider

**Parameters**

-   `$0` **[Object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object)?= {}** options
    -   `$0.regex` **[RegExp](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/RegExp)?= null** the regex to match the files with
    -   `$0.single` **[Number](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number)?** strategy for handling a single file `HANDLE|RETURN` (optional, default `PROMPT`)
    -   `$0.multi` **[Number](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number)?** strategy for handling multiple files `HANDLE|PROMPT|RETURN|PROMPT_AND_HANDLE` (optional, default `PROMPT_AND_HANDLE`)
    -   `$0.choiceAll` **[Boolean](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Boolean)?** if `true` a choice to select all files is included when multiple files are found (optional, default `true`)
    -   `$0.handler` **[function](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/function)?= null** function to call when `HANDLE|PROMPT_AND_HANDLE` strategies are selected
    -   `$0.promptHeader` **[String](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)?= defaultPromptHeader** header when prompting user to select a file
    -   `$0.promptFooter` **[String](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)?= defaultPromptFooter** footer when prompting user to select a file

Returns **FilesProvider** the files provider

## License

MIT
