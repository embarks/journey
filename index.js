'use strict'
const cheerio = require('cheerio')
const rn = require('request')
const chalk = require('chalk')

const log = console.log
const error = console.error

const BASE_URL = 'https://www.erowid.org/'

process.on('exit', function (code) {
  return console.log(`exiting with code ${code}`)
})

function handlePreloadError (err) {
  error(err)
  process.exit(err.code)
}

rn.get(BASE_URL, function (err, res, body) {
  if (err) handlePreloadError(err)

  try {
    const $ = cheerio.load(body)
    log(chalk`Hello, {blue.bold ${$('title').text()}}`)
  } catch (err) {
    handlePreloadError(err)
  }
})
