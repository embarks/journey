#!/usr/bin/env node
'use strict'

const yar = require('yargs')

const sx = require('./scraper')
const { log } = require('./logs')

process.on('exit', function (code) {
  return log(`exiting with code ${code}`)
})

const cannabisSettings = sx('/substances/cannabis')
cannabisSettings()
