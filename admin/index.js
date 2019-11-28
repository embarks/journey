#!/usr/bin/env node
'use strict'

const args = require('yargs').argv
const { BASE_URL } = require('./config')
const { log } = require('./util')

process.on('exit', function (code) {
  return log(`exiting with code ${code}`)
})

async function helloScraper () {
  // is admin tool
  const scraper = require('./scraper')
  const ping = scraper.get('/ping')
  ping()
  // scraper.get('/substances')
}

helloScraper()
// hello()
