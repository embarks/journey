#!/usr/bin/env node
'use strict'

// const args = require('yargs').argv
const { log } = require('./util')

process.on('exit', function (code) {
  return log(`exiting with code ${code}`)
})

async function helloScraper () {
  // is admin tool
  const sx = require('./scraper')
  const ping = sx('/ping')
  ping()
  const substances = sx('/substances')
  substances()
}

helloScraper()
// hello()
