#!/usr/bin/env node
'use strict'

// const args = require('yargs').argv
const sx = require('./scraper')
const { log } = require('./logs')

process.on('exit', function (code) {
  return log(`exiting with code ${code}`)
})

function update () {
  const initList = sx('/cat')
  initList()
}

function scrapeToadVenomExperiences () {
  // const toadVenomSettings = sx('/substances/toad-venom')
  // toadVenomSettings()
  const toadVenomExps = sx('/experiences/toad-venom')
  toadVenomExps()
}

function scrapeCannabisExperiences () {
  // const cannabisSettings = sx('/substances/cannabis')
  // cannabisSettings()
  const cannabisExperiences = sx('/experiences/cannabis')
  cannabisExperiences()
}

// scrapeToadVenomExperiences()
scrapeCannabisExperiences()

// function testEncodingProblems () {
//   const fs = require('fs')
//   const { oaty } = require('./scraper/util')
//   oaty.get('https://erowid.org/experiences/exp.php?ID=14584', ($) => {
//     const data = iconv.decode(Buffer.from($('.report-text-surround').text(), 'latin1'), 'windows1252')
//     console.log(data)
//     fs.writeFileSync('./test_iso-8859-1', data)
//   })
// }
// testEncodingProblems()
