# files-provider

Provides apps with file(s) identified via a regex.

```js
const opener = require('opener')
const { OPEN, PROMPT_AND_OPEN, createFilesProvider } = require('files-provider')

const provideFiles = createFilesProvider({
    single       : OPEN
  , multi        : PROMPT_AND_OPEN
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


## License

MIT
