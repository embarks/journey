#!/usr/bin/env node
'use strict'
const fs = require('fs')
const rp = require('request-promise')
const cheerio = require('cheerio')
const chalk = require('chalk')
const { error, log } = require('../logs')
const { DATFILES, reportsDir, substanceFile } = require('../fileAPI')

const initCache = {}

function isInitialized (key) {
  try {
    if (!key) {
      const isInitialized = fs.existsSync(DATFILES) &&
        fs.existsSync(reportsDir) &&
        fs.existsSync(substanceFile)
      if (isInitialized) {
        initCache[substanceFile] = true
        initCache[reportsDir] = true
        initCache[DATFILES] = true
        return true
      }
      return false
    } else if (!initCache[key]) {
      fs.accessSync(
          `${process.cwd()}${key}`,
          fs.constants.R_OK | fs.constants.W_OK
      )
      initCache[key] = true
    }
    return initCache[key]
  } catch (err) {
    error(chalk`{bold.red ERR!} You must initialize the scraper before scraping`)
    handleError(err)
  }
}

function init () {
  if (!fs.existsSync(DATFILES)) {
    fs.mkdirSync(DATFILES)
  } else log(chalk`{bold.yellow WARN!} DATFILES already initialized`)
  if (!fs.existsSync(reportsDir)) {
    fs.mkdirSync(reportsDir)
  } else log(chalk`{bold.yellow WARN!} REPORTS already initialized`)
  if (!fs.existsSync(substanceFile)) {
    fs.closeSync(fs.openSync(substanceFile, 'w'))
  } else log(chalk`{bold.yellow WARN!} substances file already initialized`)
  initCache[substanceFile] = true
  initCache[reportsDir] = true
  initCache[DATFILES] = true
}

const oaty = (function () {
  function cheerioify (consume) {
    return async body => {
      try {
        const $ = cheerio.load(body)
        await consume($)
      } catch (err) {
        handleError(err)
      }
    }
  }

  return {
    get: async function (uri, consume) {
      if (
        isInitialized(substanceFile) &&
        isInitialized(reportsDir)
      ) {
        try {
          const body = await rp({
            method: 'GET',
            uri,
            encoding: 'latin1'
          })
          await cheerioify(consume)(body)
          return
        } catch (e) {
          handleError(e)
        }
      }
    }
  }
})()

function handleError (err) {
  if (err) {
    error(chalk`{bold.red ERR!} Scrape precondition failed:`, err)
    throw new Error('An erowid scraper precondition failed')
  }
}

function isAllOption (sval) {
  return parseInt(sval) === 0
}

function delay (ms) {
  return new Promise(function (resolve) { return setTimeout(resolve, ms) })
};

module.exports = {
  isInitialized,
  isAllOption,
  handleError,
  oaty,
  init,
  delay
}
