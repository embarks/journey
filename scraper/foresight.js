// foresight is called when updates to scraped data happen
// it should try to read the lists and create routes
const fs = require('fs')
const chalk = require('chalk')
const fileAPI = require('../fileAPI')
const { error, log } = require('../logs')
const { handleError, isAllOption } = require('./util')
const config = require('./config')

module.exports = (function () {
  let keys = []
  let prefix = ''
  const wisdom = {}

  function experiences (substance) {
    try {
      // if you try to get an experience that hasn't been scraped
      // foresight will just skip this substance
      // return a function to take in the scraper function
      const reports = fileAPI.reports.read()

      return function setting (scrape) {
        // the callback that makes the scrape happen

        return async function parseRowsThenScrape () {
          const hasExists = typeof wisdom.has !== 'undefined'
          if (!hasExists) wisdom.has = {}

          // if it is a hard scrape, scrape everything regardless
          if (!config.hard) {
            log('Doing pre-scrape check... 🔭')
            reports.forEach(({ id, list }) => {
              wisdom.has[id] = list
            })
          }
          let experiences = []
          try {
            experiences = fileAPI.experiences.read(substance)
          } catch (e) {
            error(`ERR! There was a problem accessing the reports directory.\nDo not call on foresight("experiences", ${substance}) unless that substance's settings report has been generated.`)
            error(e)
          }

          await scrape(experiences.filter(({ id, substanceList, title }) => {
            const notYetScraped = typeof wisdom.has[id] === 'undefined'
            if (!notYetScraped) log(chalk`{blue (skipped)} {bold.white #${id}} [${substanceList}] ${title}`)
            if (!config.hard) wisdom.has[id] = title
            return notYetScraped
          }))
        }
      }
    } catch (e) {
      error('ERR! There was a problem accessing the settings reports for the reports directory. Do not run foresight("experiences") unless the scraper has been initialized\n')
      error(e)
    }
  }

  function substances () {
    try {
      log('🚬 Checking the inventory...')

      keys = fileAPI.substances.read().map(([key, sval]) => {
        let path = `/${prefix}/${key}`
        if (isAllOption(sval)) {
          wisdom[path] = null
          path = `/${prefix}`
        }
        wisdom[path] = null
        return { key, sval }
      })

      return experiences
    } catch (e) {
      error('ERR! Do not call on foresight("substances") unless scraper is initialized')
      handleError(e)
    }
  }

  const foresight = function (farg, ...args) {
    prefix = farg

    // called depending on how foresight is called
    const foresight = {
      substances,
      experiences
    }

    if (typeof foresight[farg] === 'function') return foresight[farg](...args)
    throw Error(`You referenced a foresight that doesn't exist (${farg})
foresight(arg) must be one of foresight(${Object.keys(foresight).join(' | ')})`)
  }

  foresight.settings = wisdom

  foresight.experiences = experiences

  foresight.wisdom = function (makePath) {
    keys.forEach(pair => {
      const { key, sval } = pair
      const path = `/${prefix}/${key}`
      wisdom[path] = makePath({ key, sval, keys })
      if (typeof wisdom.substanceList === 'undefined') wisdom.substanceList = []
      if (isAllOption(sval)) {
        wisdom[`/${prefix}`] = makePath({ key, sval, keys })
      } else if (wisdom.substanceList.indexOf(key) === -1) {
        wisdom.substanceList.push(key)
      }
    })
    return foresight.settings
  }

  return foresight
})()
