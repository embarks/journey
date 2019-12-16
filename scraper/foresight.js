// foresight is called when updates to scraped data happen
// it should try to read the lists and create routes
const fs = require('fs')
const { error } = require('../logs')
const { handleError, isAllOption } = require('./util')

module.exports = (function () {
  let keys = []
  let prefix = ''
  const wisdom = {}

  function experiences (substance) {
    try {
      // if you try to get an experience that hasn't been scraped
      // foresight will just skip this substance
      fs.accessSync(`${process.cwd()}/datfiles/${substance}`, fs.constants.R_OK)
      // return a function to take in the scraper function
      return function setting (scrape) {
        return function readUrlsThenScrape () {
          fs.readFile(`${process.cwd()}/datfiles/${substance}`, (err, data) => {
            handleError(err)
            const urls = data
              .toString()
              .split('%')[0]
              .split(/\r?\n/)
            urls.pop()
            scrape(substance, urls)
          })
        }
      }
    } catch (e) {
      error(`ERR! Do not call on foresight("experiences", ${substance}) unless the report locations for that substance have been scraped (/substances/${substance})`)
      error(e)
    }
  }

  function substances () {
    try {
      const optionList =
      fs.readFileSync(`${process.cwd()}/datfiles/substances`)
        .toString()
        .split('%')[0]
        .split(/\r?\n/)
      optionList.pop()
      keys = optionList.map(option => {
        const [sval, ...rest] = option.split(/,(.+)/)
        const key = rest.join('')
          .toLowerCase().trim()
          .replace(/-|\s-\s/g, ' ')
          .replace(/(\s|\/)/g, '-')
        let path = `/${prefix}/${key}`
        if (isAllOption(sval)) {
          wisdom[path] = null
          path = `/${prefix}`
        }
        wisdom[path] = null
        return { key, sval }
      })
      foresight.settings = wisdom
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
      wisdom[path] = makePath({ key, sval })
      if (isAllOption(sval)) { wisdom[`/${prefix}`] = makePath({ key, sval }) }
    })
    foresight.settings = wisdom
    return foresight.settings
  }

  return foresight
})()
