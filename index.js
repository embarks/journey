#!/usr/bin/env node
'use strict'

// const args = require('yargs').argv
const sx = require('./scraper')
const { log } = require('./logs')

process.on('exit', function (code) {
  return log(`exiting with code ${code}`)
})

async function initScraper () {
  // const init = sx('/initialize')
  // const init = sx('/cat')
  const ping = sx('/ping')
  // init()
  ping()
}

async function helloScraper () {
  // list report urls
  // and calculate report stats
  const substance = 'cannabis'
  const cannabisSettings = sx(`/substances/${substance}`)
  // substance = 'LSD'
  // const lsdSettings = sx(`/substances/${substance}`)
  // substance = 'all'
  // const allSettings = sx(`/substances/${substance}`)
  cannabisSettings()
  // lsdSettings()
  // allSettings()
}

initScraper()
// helloScraper()
