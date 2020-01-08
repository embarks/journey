'use strict'
const qs = require('qs')
const fs = require('fs')
const chalk = require('chalk')
const sanitize = require('sanitize-filename')
const ic = require('iconv-lite')
const { log, error } = require('../logs')
const { handleError, isAllOption } = require('./util')
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
  log(chalk`📝 {bold.green Success} Listed substances`)
}

function getTotal ($) {
  const totalText = $('center')
    .first()
    .children('font').children('b')
    .text()
  const totalInt = parseInt(totalText.substring(1, totalText.length - 1))
  if (Number.isNaN(totalInt) || totalInt < 0) {
    throw Error('Couldn\'t find the total number of posts for that experience!')
  }

  return totalInt
}

function decode (data) {
  return ic.decode(Buffer.from(data, 'latin1'), 'windows1252')
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
      log(chalk`📝 {bold.green Setting} {bold.white #${id}}: ${title} [${substanceList}]`)

      if (i === rows.length - 1) {
        log(chalk`📝 {bold.bgBlack.white ${substance}} {bold.green Wrote} ${rows.length} settings`)
      }
      return `${id},"${title}","${substanceList}"`
    })
    return {
      data: reportList.get().join('\n'),
      rows: reportList.toArray()
    }
  }
  function ListConsumer ({ substance, pageInfo }) {
    // determine whether to append or write new file
    const isFirstPage = pageInfo.start === 0
    const isFinalPage = !pageInfo.hasNext
    const OP = isFirstPage ? 'writeFileSync' : 'appendFileSync'
    const SF = `${DATFILES}/${substance}`
    return ($) => {
      const { data, rows } = consumeList($, substance)
      fs[OP](`${data}\n`)
      if (isFinalPage) {
        fs.appendFileSync(SF, '%', handleError)
      }
      log(chalk`📝 {bold.bgBlack.white ${substance}} Collected experiences... {yellow ${isFirstPage ? '1' : pageInfo.start}} to {yellow ${rows.length}}`)
    }
  }

  ListConsumer.consume = consumeList

  return ListConsumer
})()

function experienceConsumer ({ id, title, substanceList }) {
  // this will happen async
  // TODO deal with pulled quotes
  return ($) => {
    const fn = `#${id} [${substanceList}] ${title}`
    const datfile = `${DATFILES}/reports/${sanitize(fn)}`
    $('.report-text-surround').find('table').remove()
    const data = $('.report-text-surround').text().trim() ||
      $('body').text().trim()
    if (!data) {
      error(`ERR! No data found for #${id} [${substanceList}] ${title}`)
    } else {
      try {
        fs.writeFileSync(
          datfile,
          decode(data)
        )
        log(chalk`👄 {bold.bgBlack.white #${id}} {bold.green Scraped} ${fn}`)
      } catch (e) {
        handleError(e)
      }
    }
  }
}

module.exports = {
  sayHello,
  listSubstances,
  getTotal,
  reportListConsumer,
  experienceConsumer
}
