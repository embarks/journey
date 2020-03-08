#!/usr/bin/env node
'use strict'
const { BASE_URL, XP_BASE_PATH, XP_VAULT_PATH, REPORT_PATH } = require('./config')
const { delay, oaty, init, isAllOption } = require('./util')
const {
  sayHello,
  listSubstances,
  getTotal,
  reportListConsumer,
  experienceConsumer
} = require('./consumers')

// BE NICE
var http = require('http')
var https = require('https')
http.globalAgent.maxSockets = 1
https.globalAgent.maxSockets = 1

module.exports = (function scraper () {
  const foresight = require('./foresight')

  function fromWisdom ({ key: oKey, sval: oSval, keys }) {
    async function collectBySubstance ({ key, sval } = { key: oKey, sval: oSval }) {
      // construct the url
      const url = ({ start, max }) => `${BASE_URL}/${XP_BASE_PATH}/${XP_VAULT_PATH}?S1=${sval}&Max=${max}&Start=${start}`

      let start = 0
      let max = 100

      await oaty.get(url({ start, max }), async $ => {
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
          await oaty.get(url({ start, max }), consume)
        }
      })
    }

    if (isAllOption(oSval)) {
      const bySubstance = keys.filter(({ sval }) => !isAllOption(sval))
      return () => {
        bySubstance.forEach(collectBySubstance)
      }
    }
    return collectBySubstance
  }

  async function scrapeFromExperience (ids) {
    const consume = async function (experience) {
      const { id } = experience
      const url = `${BASE_URL}/${XP_BASE_PATH}/${REPORT_PATH}?id=${id}`
      await oaty.get(url, experienceConsumer(experience))
    }

    for (var i in ids) {
      const id = ids[i]
      if (i !== 0) {
        await delay(500)
      }
      await consume(id)
    }
  }

  scraper.getResolveFromWisdom = fromWisdom
  scraper.scrapeFromExperience = scrapeFromExperience

  const resolver = {
    '/initialize': async () => {
      init()
      await oaty.get(`${BASE_URL}/${XP_BASE_PATH}`, listSubstances)
    },
    '/cat': async () => {
      await oaty.get(`${BASE_URL}/${XP_BASE_PATH}`, listSubstances)
    },
    '/ping': async () => {
      await oaty.get(BASE_URL, sayHello)
    }
  }

  let adultResolver = { ...resolver }
  let sitter // the experience report scraper prepper!

  return (route) => {
    if (!route) throw Error('You must provide a path to the scraper')
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
        // scraped during the same run
        if (typeof foresight.settings[route] !== 'undefined') {
          const scrapeSettings = foresight.wisdom(fromWisdom)
          adultResolver = Object.assign(adultResolver,
            // provide all the substance route resolvers to collect report urls
            scrapeSettings
          )
          adultResolver[route].all = Object.keys(foresight.settings)
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
              [`/experiences/${substance}`]: setting(scrapeFromExperience)
            }
          )
        }
      }
    }
    return adultResolver[route]
  }
})()
