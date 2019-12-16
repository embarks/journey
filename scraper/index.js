#!/usr/bin/env node
'use strict'
// var qs = require('qs')
const { URL } = require('url')
const { BASE_URL, XP_BASE_PATH, XP_VAULT_PATH, REPORT_PATH } = require('./config')
const { oaty, init, isAllOption } = require('./util')
const {
  sayHello,
  listSubstances,
  getTotal,
  reportListConsumer,
  experienceConsumer
} = require('./consumers')

module.exports = (function scraper () {
  const foresight = require('./foresight')

  function fromWisdom ({ key, sval }) {
    return () => {
      if (isAllOption(sval)) {
        return () => {
          console.warn('nothing to see here')
        }
      }
      // constrcut the url
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
        // 2: consume the remaining reports efficiently
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

  function recordExperiences (substance, ids) {
    const consumeSubstance = function (id, idx) {
      oaty.get(`${BASE_URL}/${XP_BASE_PATH}/${REPORT_PATH}?id=${id}`, experienceConsumer(substance))
    }
    ids.forEach(consumeSubstance)
  }

  scraper.getResolveFromWisdom = fromWisdom
  scraper.scrapeFromExperience = recordExperiences

  const resolver = {
    '/initialize': (next) => {
      init()
      oaty.get(`${BASE_URL}/${XP_BASE_PATH}`, (...res) => {
        listSubstances(...res)
        if (next) next()
      })
    },
    '/cat': () => {
      oaty.get(`${BASE_URL}/${XP_BASE_PATH}`, listSubstances)
    },
    '/ping': () => {
      oaty.get(BASE_URL, sayHello)
    }
  }

  let adultResolver = { ...resolver }
  let sitter // the experience report scraper prepper!

  return (path) => {
    if (!path) throw Error('You must provide a path to the scraper')
    const url = new URL(path, 'foo://emwaves.org')
    const route = url.pathname
    const routeExists = typeof adultResolver[route] === 'function'
    if (!routeExists) {
      if (route.startsWith('/substances')) {
        // synchronously read from files scraped by initialization
        // provide the previously scraped information required for the process
        if (
          typeof sitter === 'undefined' ||
          typeof foresight.settings[route] === 'undefined'
        ) {
          sitter = foresight('substances') // -> experiences
        }
        // only have to call on wisdom once because all the substances are
        // scraped at the same time
        if (typeof foresight.settings[route] !== 'undefined') {
          const scrapeSettings = foresight.wisdom(fromWisdom)
          adultResolver = Object.assign(adultResolver,
            // provide all the substance route resolvers to collect report urls
            scrapeSettings
          )
        } else console.warn(`You can't smokem ${route}!`)
      }

      if (route.startsWith('/experiences/')) {
        if (typeof sitter === 'undefined') {
          // you don't need to run substance in the same command chain
          // as long as the substance files are there, can get experiences
          // so still need to conduct foresight maneuver
          // which in this case reads from the substance settings file
          // file access is synchronous
          sitter = substance => foresight.experiences(substance)
        }
        // only run the readfile for a substance when asked
        const substance = route.split('/').pop()
        // call this for every substance and allow kick off for the scrape
        const setting = sitter(substance)
        if (typeof setting === 'function') {
          adultResolver = Object.assign(adultResolver,
            {
              // provide that experience as a route
              [`/experiences/${substance}`]: setting(recordExperiences)
            }
          )
        }
      }
    }

    return adultResolver[route]
  }
})()
