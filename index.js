#!/usr/bin/env node
'use strict'

// const args = require('yargs').argv
const sx = require('./scraper')
const { log } = require('./logs')

process.on('exit', function (code) {
  return log(`exiting with code ${code}`)
})

function initScraper (hello) {
  const init = sx('/initialize')
  const initList = sx('/cat')
  init(hello)
  initList()
  const ping = sx('/ping')
  ping()
}

function helloScraper () {
  // list report urls
  // and calculate report stats
  // let substance = 'cannabis'
  // const cannabisSettings = sx(`/substances/${substance}`)
  // substance = 'lsd'
  // const lsdSettings = sx(`/substances/${substance}`)
  // substance = 'toad-venom'
  // const toadVenomSettings = sx(`/substances/${substance}`)
  // substance = 'bad-test'
  // const badSettings = sx(`/substances/${substance}`)
  const allSettings = sx('/substances')
  // cannabisSettings()
  // lsdSettings()
  // toadVenomSettings()
  allSettings()
}

function scrapeToadVenomExperiences () {
  // const toadVenomSettings = sx('/substances/toad-venom')
  // toadVenomSettings()
  const toadVenomExps = sx('/experiences/toad-venom')
  toadVenomExps()
}

initScraper()
// helloScraper()
// scrapeToadVenomExperiences()
