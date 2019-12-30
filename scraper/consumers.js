'use strict'
const qs = require('qs')
const fs = require('fs')
const chalk = require('chalk')
const { log } = require('../logs')
const { handleError, isAllOption } = require('./util')
const readline = require('readline')

const DATFILES = `${process.cwd()}/datfiles`

function sayHello ($) {
  log(chalk`👋 Hello, {blue ${$('title').text()}}`)
}

function listSubstances ($) {
  log('📝 Listing substances...')
  const substances = $('select[name="S1"]').children('option')
  const data = []
  substances.each(function (i, e) {
    const sval = $(e).val()
    const name = isAllOption(sval) ? 'all' : $(e).text()
    data.push(`${sval},${name}`)
  })
  data.push('%')
  fs.writeFileSync(`${DATFILES}/substances`, data.join('\n'))
  log(chalk`{bold.green Success} Listed substances`)
}

function getTotal ($) {
  const totalText = $('center')
    .first()
    .children('font').children('b')
    .text()
  return parseInt(totalText.substring(1, totalText.length - 1))
}

// consume list by substance and page fetched
const reportListConsumer = (function () {
  // consume body of page
  function consumeList ($, substance) {
    const rows = $('#results-form').find('tr:has(a)')
    const reportList = rows.map((i, elem) => {
      const title = $(elem).find('a')
        .text()
        .trim()
        .replace('"', "'")

      const substanceList = $(elem).find('td:nth-child(4)')
        .text()
        .trim()
        .replace('"', "'")
        .replace('[', '(')
        .replace(']', ')')

      const [id] = Object.values(qs.parse($(elem).find('a').attr('href')))
      if (i !== 0) {
        readline.cursorTo(process.stdout, 0)
      }
      process.stdout.write(chalk`{bold.green Consuming} #${id}: ${title} [${substanceList}]`)

      if (i === rows.length - 1) {
        readline.cursorTo(process.stdout, 0)
        process.stdout.write(chalk`{bold.bgBlack.white ${substance}} {bold.green Wrote} ${rows.length} rows`)
        process.stdout.write('\n')
      }
      return `${id},"${title}","${substanceList}"`
    }).get().join('\n')
    return reportList
  }
  function ListConsumer ({ substance, pageInfo }) {
    // determine whether to append or write new file
    const isFirstPage = pageInfo.start === 0
    const isFinalPage = !pageInfo.hasNext
    const OP = isFirstPage ? 'writeFile' : 'appendFile'
    const SF = `${DATFILES}/${substance}`
    return ($) => {
      function write (data, done) {
        fs[OP](SF, data, (err) => {
          handleError(err)
          done()
        })
      }
      log(chalk`{bold.bgBlack.white ${substance}} Collecting experiences... {yellow ${pageInfo.start}} to {yellow ${pageInfo.max}}`)
      const data = consumeList($, substance)
      write(`${data}\n`, () => {
        if (isFinalPage) {
          log(chalk`{bold.bgBlack.white ${substance}} Appending final page of experiences...`)
          fs.appendFile(SF, '%', handleError)
        }
      })
    }
  }

  ListConsumer.consume = consumeList

  return ListConsumer
})()

function experienceConsumer ({ id, title, substanceList }) {
  log(chalk`{bold.bgBlack.white #${id}} Initializing experience consumer`)
  // this will happen async
  // TODO deal with pulled quotes
  return ($) => {
    const fn = `#${id}: [${substanceList}] ${title}`
    const datfile = `${DATFILES}/reports/${fn}`
    log(chalk`{bold.bgBlack.white #${id}} {bold.blue Scraping} ${fn}`)
    $('.report-text-surround').find('table').remove()
    const data = $('.report-text-surround').text().trim()
    fs.writeFile(datfile, data, (err) => {
      log(chalk`{bold.bgBlack.white #${id}} {bold.green Scraped} ${fn}`)
      handleError(err)
    })
  }
}

module.exports = {
  sayHello,
  listSubstances,
  getTotal,
  reportListConsumer,
  experienceConsumer
}
