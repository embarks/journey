#!/usr/bin/env node
'use strict'

const yar = require('yargs')

const sx = require('./scraper')
const { log } = require('./logs')

process.on('exit', function (code) {
  return log(`exiting with code ${code}`)
})

async function caffeine () {
  const caffeineSettings = sx('/substances/caffeine')
  await caffeineSettings()

  const caffeineExperiences = sx('/experiences/caffeine')
  await caffeineExperiences()

  const toadVenomSettings = sx('/substances/toad-venom')
  await toadVenomSettings()
}

caffeine()
