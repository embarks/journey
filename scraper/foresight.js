// foresight is called when updates to scraped data happen
// it should try to read the lists and create routes
const fs = require('fs')
const chalk = require('chalk')
const { error, log } = require('../logs')
const { handleError, isAllOption } = require('./util')
const config = require('./config')

module.exports = (function () {
  let keys = []
  let prefix = ''
  const wisdom = {}

  function experiences (substance) {
    const cwd = `${process.cwd()}/datfiles`
    const reportsDir = `${cwd}/reports/`
    const substanceFile = `${cwd}/${substance}`

    try {
      // if you try to get an experience that hasn't been scraped
      // foresight will just skip this substance
      fs.accessSync(substanceFile, fs.constants.R_OK)
      // return a function to take in the scraper function
      return function setting (scrape) {
        // the callback that makes the scrape happen
        return function parseRowsThenScrape () {
          const hasExists = typeof wisdom.has !== 'undefined'
          if (!hasExists) wisdom.has = {}
          try {
            // if it is a hard scrape, scrape everything regardless
            if (!config.hard) {
              log('🔭 Doing pre-scrape check...')
              const reports = fs.readdirSync(reportsDir)
              reports.forEach(filename => {
                const idPtrn = /^#(\d*?):/
                const lstPtrn = /^\[(.*?)\]/
                let id = filename.match(idPtrn).shift()
                let list = filename
                  .substring(id.length + 1, filename.length)
                  .trim()
                  .match(lstPtrn)
                  .shift()
                id = id.substring(1, id.length - 1)
                list = list.substring(1, list.length - 1)
                log(chalk`🔭 {blue (skipped)} {bgBlack.bold.white #${id}} ${filename}`)
                wisdom.has[id] = list
              })
            }
          } catch (e) {
            error(`ERR! There was a problem accessing ${reportsDir}\nDo not call on foresight("experiences", ${substance}) unless the scraper has been initialized`)
            error(e)
          }

          fs.readFile(substanceFile, (err, data) => {
            handleError(err)
            const rows = data
              .toString()
              .split('%')[0]
              .split(/\r?\n/)
            rows.pop()

            const experiences = rows.map((experience) => {
              const [id, oTitle, oSubstanceList] = experience.split(',"')
              const title = oTitle.replace('"', '')
              const substanceList = oSubstanceList.replace(/("|\[|\])/, '')
              return Object.freeze({ id, title, substanceList })
            })

            scrape(experiences.filter(({ id, substanceList }) => {
              const notYetScraped = typeof wisdom.has[id] === 'undefined'
              if (!config.hard) wisdom.has[id] = substanceList
              return notYetScraped
            }))
          })
        }
      }
    } catch (e) {
      error(`ERR! There was a problem accessing ${substanceFile}\nDo not call on foresight("experiences", ${substance}) unless the report locations for that substance have been scraped (/substances/${substance})`)
      error(e)
    }
  }

  function substances () {
    try {
      log('🚬 Checking the inventory...')
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
      if (isAllOption(sval)) { wisdom[`/${prefix}`] = makePath({ key, sval, keys }) }
    })
    return foresight.settings
  }

  return foresight
})()
