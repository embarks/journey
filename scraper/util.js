#!/usr/bin/env node

const fs = require('fs')
const rn = require('request')
const cheerio = require('cheerio')
const chalk = require('chalk')
const { error } = require('../logs')

const initCache = {}

function isInitialized (key) {
  try {
    if (!initCache[key]) {
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
  fs.mkdirSync(`${process.cwd()}/datfiles`)
  fs.mkdirSync(`${process.cwd()}/datfiles/reports`)
  fs.closeSync(fs.openSync(`${process.cwd()}/datfiles/substances`, 'w'))
  initCache['/datfiles/substances'] = true
  initCache['/datfiles/reports'] = true
  initCache['/datfiles'] = true
}

function oaty (url, consumer) {
  if (isInitialized('/datfiles/substances')) {
    rn.get(url, (err, res, body) => {
      if (err) handleError(err)
      try {
        const $ = cheerio.load(body)
        consumer($)
      } catch (err) {
        handleError(err)
      }
    })
  }
}

function handleError (err) {
  error(chalk`{bold.red ERR!} Scrape precondition failed`)
  error(err)
  process.exit(err.code)
}

module.exports = {
  handleError,
  oaty,
  init
}
