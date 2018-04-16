'use strict'

const opener = require('opener')
const { HANDLE, PROMPT_AND_HANDLE, createFilesProvider } = require('./')

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
