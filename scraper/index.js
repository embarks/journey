#!/usr/bin/env node
'use strict'
// var qs = require('qs')
const { URL } = require('url')
const { BASE_URL, XP_BASE_PATH } = require('./config')
const { oaty, init } = require('./util')
const { sayHello, listSubstances, listReportLocs } = require('./consumers')

module.exports = function scraper (path) {
  const url = new URL(path, 'foo://emwaves.org')
  const route = url.pathname
  // const options = qs.parse(url.search.slice(1, url.search.length))

  const foresight = require('./foresight')
  if (![
    '/initialize',
    '/listup',
    '/ping'
  ].includes(path)) foresight()

  const resolver = {
    '/initialize': () => {
      init()
      oaty(`${BASE_URL}/${XP_BASE_PATH}`, listSubstances)
    },
    '/listup': () => {
      oaty(`${BASE_URL}/${XP_BASE_PATH}`, listSubstances)
    },
    '/ping': () => {
      oaty(BASE_URL, sayHello)
    },
    '/substances': () => {
      // get all substances
    },
    ...foresight.wisdom(listReportLocs)
  }

  return resolver[route]
}
