#!/usr/bin/env node
'use strict'

// const args = require('yargs').argv
const sx = require('./scraper')
const { log } = require('./logs')

process.on('exit', function (code) {
  return log(`exiting with code ${code}`)
})

async function initScraper () {
  const init = sx('/initialize')
  const ping = sx('/ping')
  init()
  ping()
}

async function helloScraper () {
  let substance = 'cannabis'
  const cannabisExps = sx(`/substances/${substance}`)
  substance = 'LSD'
  const lsdExps = sx(`/substances/${substance}`)
  substance = 'all'
  const allExps = sx(`/substances/${substance}`)
  cannabisExps()
  lsdExps()
  allExps()
}

initScraper()
// helloScraper()
