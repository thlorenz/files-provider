'use strict'

const { prompt } = require('promptly')
const { promisify } = require('util')
const table = require('text-table')
const path = require('path')
const fs = require('fs')
const readdir = promisify(fs.readdir)
const stat = promisify(fs.stat)
const access = promisify(fs.access)

const assert = require('assert')

async function canRead(p) {
  try {
    await access(p, fs.constants.R_OK)
    return true
  } catch (err) {
    return false
  }
}

function maxFileTime(fsStat) {
  // Returns the latest timestamp of a file, selecting between atime,
  // mtime, and ctime.
  const { atime, mtime, ctime } = fsStat;
  const a = atime >= mtime ? atime : mtime;
  return a >= ctime ? a : ctime;
}

async function resolveFromDirectory(root, regex) {
  const allEntries = await readdir(root)
  const files = []
  for (const entry of allEntries) {
    if (!regex.test(entry)) continue

    const fullPath = path.join(root, entry)
    if (!(await canRead(fullPath))) continue
    const entryStat = await stat(fullPath)
    if (!(entryStat.isFile())) continue
    const timestamp = maxFileTime(entryStat).toString().substr(0, 24);
    files.push({ fullPath, entry, timestamp })
  }

  return files
}

const ALL = { entry: 'All' }
const ALL_KEY = '0'
const defaultPromptHeader = 'Please select a file below:'
const defaultPromptFooter = 'Your choice: '

function makeSelectable(files, choiceAll) {
  const map = new Map()
  for (var i = 0; i < files.length; i++) {
    map.set(`${i + 1}`, files[i])
  }
  if (choiceAll) map.set(ALL_KEY, ALL)
  return map
}

function createValidator(map) {
  return val => {
    if (map.has(val)) return val
    throw new Error(
      `Invalid choice: '${val}', please select one of the given numbers`
    )
  }
}

function createPromptMsg(map, promptHeader, promptFooter) {
  let msg = `${promptHeader}\n\n`
  const lines = []
  for (const [ selector, { entry, timestamp } ] of map) {
    lines.push([`\t${selector}:`, entry, ` ${timestamp}`])
  }
  msg += table(lines, { align: [':', 'l', 'l'] })
  return `${msg}\n\n${promptFooter}`
}

const HANDLE = 1
const PROMPT = 2
const RETURN = 3
const PROMPT_AND_HANDLE = 4

class FilesProvider {
  constructor({
      regex
    , single
    , multi
    , choiceAll
    , handler
    , promptHeader
    , promptFooter
  } = {}) {
    assert(regex instanceof RegExp, 'Please provide a RegExp via regex')
    assert.notEqual(single, PROMPT, 'Prompting to select a single file makes no sense')
    assert.notEqual(single, PROMPT_AND_HANDLE, 'prompting to select a single file makes no sense')
    if (single === PROMPT_AND_HANDLE || single === HANDLE ||
        multi === PROMPT_AND_HANDLE || multi === HANDLE) {
      assert.equal(typeof handler, 'function', 'Please provide a handler to handle the file.')
    }

    this._regex = regex
    this._single = single
    this._multi = multi
    this._choiceAll = choiceAll
    this._handler = handler
    this._promptHeader = promptHeader
    this._promptFooter = promptFooter
  }

  /**
   * Returns or handles matched files from the given directory.
   *
   * @name FilesProvider.fromDirectory
   *
   * @param {String} [root=process.cwd()] directory to open files from (defaults to working directory)
   * @returns {Array.<Object>} files if `RETURN` is the selected strategy
   */
  async fromDirectory(root = process.cwd()) {
    const files = await resolveFromDirectory(root, this._regex)
    return await this._processFiles(files)
  }

  async _processFiles(files) {
    if (files.length === 0) return []
    if (files.length === 1) return this._processSingleFile(files[0])
    return await this._processMultipleFiles(files)
  }

  _processSingleFile(file) {
    if (this._single === RETURN) return [ file ]
    if (this._single === HANDLE) this._handler(file)
  }

  async _processMultipleFiles(files) {
    if (this._multi === RETURN) return files
    if (this._multi === PROMPT || this._multi === PROMPT_AND_HANDLE) {
      const { choice, selectableFiles } = await this._promptForFile(files)
      if (this._multi === PROMPT) {
        if (choice === ALL_KEY) return files
        return [ selectableFiles.get(choice) ]
      } else {
        if (choice === ALL_KEY) {
          for (const file of files) this._handler(file)
        } else {
          this._handler(selectableFiles.get(choice))
        }
      }
    }
    if (this._multi === HANDLE) {
      for (const file of files) this._handler(file)
    }
  }

  async _promptForFile(files) {
    const selectableFiles = makeSelectable(files, this._choiceAll)
    const promptMsg = createPromptMsg(
      selectableFiles, this._promptHeader, this._promptFooter
    )
    const choice = await prompt(
        promptMsg
      , { validator: createValidator(selectableFiles) }
    )
    return { choice, selectableFiles }
  }
}

/**
 * Creates a FilesProvider
 *
 * @param {Object} $0 options
 * @param {RegExp} $0.regex the regex to match the files with
 * @param {Number} [$0.single = PROMPT] strategy for handling a single file `HANDLE|RETURN`
 * @param {Number} [$0.multi = PROMPT_AND_HANDLE] strategy for handling multiple files `HANDLE|PROMPT|RETURN|PROMPT_AND_HANDLE`
 * @param {Boolean} [$0.choiceAll = true] if `true` a choice to select all files is included when multiple files are found
 * @param {function} $0.handler function to call when `HANDLE|PROMPT_AND_HANDLE` strategies are selected
 * @param {String} $0.promptHeader header when prompting user to select a file
 * @param {String} $0.promptFooter footer when prompting user to select a file
 *
 * @return {FilesProvider} the files provider
 */
function createFilesProvider({
      regex = null
    , single = HANDLE
    , multi = PROMPT_AND_HANDLE
    , choiceAll = true
    , handler = null
    , promptHeader = defaultPromptHeader
    , promptFooter = defaultPromptFooter
  } = {}) {
  return new FilesProvider({
      regex
    , single
    , multi
    , choiceAll
    , handler
    , promptHeader
    , promptFooter
  })
}

module.exports = {
    createFilesProvider
  , HANDLE
  , PROMPT
  , RETURN
  , PROMPT_AND_HANDLE
}
