#!/usr/bin/env node
'use strict'
const chalk = require('chalk')
// var qs = require('qs')
const { URL } = require('url')
const { BASE_URL, XP_BASE_PATH } = require('./config')
const { log, oaty } = require('./util')
const fs = require('fs')

module.exports = function scraper (path) {
  const url = new URL(path, 'foo://emwaves.org')
  const route = url.pathname
  // const options = qs.parse(url.search.slice(1, url.search.length))

  const resolver = {
    '/ping': () => {
      function sayHello ($) {
        log(chalk.bold.blue('Knock knock...\n'))
        log(chalk`Hello, {blue ${$('title').text()}}`)
      }
      oaty(BASE_URL, sayHello)
    },
    '/substances': () => {
      function listSubstances ($) {
        const w = fs.createWriteStream(`${__dirname}/datfiles/substances`)
        const substances = $('select[name="S1"]').children('option')
        substances.each(function (i, e) {
          w.write(`${$(e).val()},${$(e).text()}${i + 1 < substances.length ? '\n' : ''}`)
        })
        w.end('\n%')
      }
      oaty(`${BASE_URL}/${XP_BASE_PATH}`, listSubstances)
    }
  }

  return resolver[route]
}
