#!/usr/bin/env node
'use strict'
// var qs = require('qs')
const { URL } = require('url')
const { BASE_URL, XP_BASE_PATH, XP_VAULT_PATH } = require('./config')
const { oaty, init } = require('./util')
const { sayHello, listSubstances, getTotal, reportListConsumer } = require('./consumers')

function createResolverFromWisdom ({ key, sval }) {
  return () => {
    const url = ({ start, max }) => `${BASE_URL}/${XP_BASE_PATH}/${XP_VAULT_PATH}?S1=${sval}&Max=${max}&Start=${start}`

    let start = 0
    let max = 100

    oaty.get(url({ start, max }), $ => {
      const total = getTotal($)
      const hasNext = total > (start + max)
      let pageInfo = { total, start, max, hasNext }
      // 1: list first page of urls
      let consume = reportListConsumer({ substance: key, pageInfo })
      // always consume the first page
      consume($)
      // 2: consume the remaining reports
      if (hasNext) {
        start = start + max
        max = max + (total - start)
        pageInfo = { start, max, total, hasNext: false }
        consume = reportListConsumer({
          substance: key,
          pageInfo
        })
        oaty.get(url({ start, max }), consume)
      }
    })
  }
}

module.exports = (function scraper () {
  const foresight = require('./foresight')
  const resolver = {
    '/initialize': () => {
      init()
      oaty.get(`${BASE_URL}/${XP_BASE_PATH}`, listSubstances)
    },
    '/cat': () => {
      oaty.get(`${BASE_URL}/${XP_BASE_PATH}`, listSubstances)
    },
    '/ping': () => {
      oaty.get(BASE_URL, sayHello)
    },
    '/substances': () => {
      // get all substances
    }
  }

  let adultResolver = { ...resolver }

  return (path) => {
    const url = new URL(path, 'foo://emwaves.org')
    const route = url.pathname

    if (![
      '/initialize',
      '/cat',
      '/ping'
    ].includes(route) &&
    !(typeof adultResolver[route] === 'function')
    ) {
      foresight('substances')
      adultResolver = {
        ...resolver,
        ...foresight.wisdom(createResolverFromWisdom)
      }
    }

    return adultResolver[route]
  }
})()
