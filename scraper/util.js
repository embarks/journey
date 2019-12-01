#!/usr/bin/env node

const fs = require('fs')
const rn = require('request')
const cheerio = require('cheerio')
const chalk = require('chalk')
const { error } = require('../logs')

const initCache = { initialized: false }

function handleError (err) {
  error(err)
  process.exit(err.code)
}

function oaty (url, consumer) {
  if (dirsInitialized()) {
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

function init () {
  if (!dirsInitialized()) {
    fs.mkdirSync(`${process.cwd()}/datfiles`)
    fs.mkdirSync(`${process.cwd()}/datfiles/reports`)
  }
}

function dirsInitialized () {
  try {
    if (!initCache.initialized) {
      fs.accessSync(`${process.cwd()}/datfiles/reports`, fs.constants.R_OK | fs.constants.W_OK)
      initCache.initialized = true
    }
    return initCache.initialized
  } catch (err) {
    error(chalk`{bold.red ERR!} You must initialize the scraper before scraping`)
    handleError(err)
  }
}

module.exports = {
  handleError,
  oaty,
  init
}
