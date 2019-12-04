'use strict'
const qs = require('qs')
const fs = require('fs')
const chalk = require('chalk')
const { log } = require('../logs')
const { handleError } = require('./util')

const DATFILES = `${process.cwd()}/datfiles`

function sayHello ($) {
  log(chalk.bold.blue('Knock knock...\n'))
  log(chalk`Hello, {blue ${$('title').text()}}`)
}

function listSubstances ($) {
  log('Listing substances...')
  const substances = $('select[name="S1"]').children('option')
  const data = []
  substances.each(function (i, e) {
    const sval = $(e).val()
    const name = $(e).text()
    data.push(`${sval},${name}`)
  })
  data.push('%')
  fs.writeFileSync(`${DATFILES}/substances`, data.join('\n'))
  log(chalk`{bold.green Success}`)
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
  function consumeList ($) {
    const rows = $('#results-form').find('a')
    return rows.map((i, elem) => {
      const [id] = Object.values(qs.parse(elem.attribs.href))
      return id
    }).get().join('\n')
  }
  function ListConsumer ({ substance, pageInfo }) {
    // determine whether to append or write new file
    const isFirstPage = pageInfo.start === 0
    const isFinalPage = !pageInfo.hasNext
    const OP = isFirstPage ? 'writeFile' : 'appendFile'
    const SF = `${DATFILES}/${substance}`
    return ($) => {
      function write (data) { fs[OP](SF, data, handleError) }
      const data = consumeList($)
      log(chalk`{bold.bgBlack.white ${substance}} Collecting experiences... {yellow ${pageInfo.start}} to {yellow ${pageInfo.max}}`)
      write(`${data}\n`)
      if (isFinalPage) {
        log(chalk`{bold.bgBlack.white ${substance}} Appending final page of experiences...`)
        fs.appendFile(SF, '%', handleError)
      }
    }
  }

  ListConsumer.consume = consumeList

  return ListConsumer
})()

module.exports = {
  sayHello,
  listSubstances,
  getTotal,
  reportListConsumer
}
