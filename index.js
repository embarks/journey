#!/usr/bin/env node
'use strict'

// const args = require('yargs').argv
const sx = require('./scraper')
const { log } = require('./logs')

process.on('exit', function (code) {
  return log(`exiting with code ${code}`)
})
