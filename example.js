'use strict'

const opener = require('opener')
const { OPEN, PROMPT_AND_OPEN, createFilesProvider } = require('./')

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
