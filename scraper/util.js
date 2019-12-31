#!/usr/bin/env node
'use strict'
const fs = require('fs')
const rn = require('request')
const cheerio = require('cheerio')
const chalk = require('chalk')
const { error, log } = require('../logs')

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
  // TODO existsSync
  if (!fs.existsSync(`${process.cwd()}/datfiles`)) {
    fs.mkdirSync(`${process.cwd()}/datfiles`)
  } else log(chalk`{bold.yellow WARN!} DATFILES already initialized`)
  if (!fs.existsSync(`${process.cwd()}/datfiles/reports`)) {
    fs.mkdirSync(`${process.cwd()}/datfiles/reports`)
  } else log(chalk`{bold.yellow WARN!} REPORTS already initialized`)
  if (!fs.existsSync(`${process.cwd()}/datfiles/substances`)) {
    fs.closeSync(fs.openSync(`${process.cwd()}/datfiles/substances`, 'w'))
  } else log(chalk`{bold.yellow WARN!} substances file already initialized`)
  initCache['/datfiles/substances'] = true
  initCache['/datfiles/reports'] = true
  initCache['/datfiles'] = true
}

const oaty = (function () {
  function cheerioify (consumer) {
    return (err, res, body) => {
      handleError(err)
      try {
        const $ = cheerio.load(body)
        consumer($)
      } catch (err) {
        handleError(err)
      }
    }
  }

  return {
    get: function (url, consumer) {
      if (
        isInitialized('/datfiles/substances') &&
        isInitialized('/datfiles/reports')
      ) {
        rn.get({
          url,
          encoding: 'latin1'
        }, cheerioify(consumer))
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

module.exports = {
  isAllOption,
  handleError,
  oaty,
  init
}
