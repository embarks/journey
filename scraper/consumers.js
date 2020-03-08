'use strict'
const qs = require('qs')
const chalk = require('chalk')
const fileAPI = require('../fileAPI')
const { log, error } = require('../logs')
const { isAllOption } = require('./util')

function sayHello ($) {
  log(chalk`👋 Hello, {blue ${$('title').text()}}`)
}

function listSubstances ($) {
  log('Listing substances...')
  const substances = $('select[name="S1"]').children('option')
  const data = []
  substances.each(function (i, e) {
    const sval = $(e).val()
    const name = isAllOption(sval) ? 'all' : $(e).text()
    return data.push({ sval, name })
  })
  fileAPI.substances.write(data)
  log(chalk`{bold.green Success} Listed substances`)
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
      log(chalk`{bold.green Setting} {bold.white #${id}}: ${title} [${substanceList}]`)

      if (i === rows.length - 1) {
        log(chalk`{bold.bgBlack.white ${substance}} {bold.green Wrote} ${rows.length} settings`)
      }
      return { id, title, substanceList }
    })
    return reportList.toArray()
  }
  function ListConsumer ({ substance, pageInfo }) {
    // determine whether to append or write new file
    const isFirstPage = pageInfo.start === 0
    const isFinalPage = !pageInfo.hasNext

    return ($) => {
      const rows = consumeList($, substance)
      fileAPI.reports.write(substance,
        rows, { isFirstPage, isFinalPage }
      )
      log(chalk`{bold.bgBlack.white ${substance}} Collected experiences {yellow ${isFirstPage ? '1' : pageInfo.start}} to {yellow ${rows.length}}`)
    }
  }

  ListConsumer.consume = consumeList

  return ListConsumer
})()

function experienceConsumer ({ id, title, substanceList }) {
  // TODO deal with pulled quotes
  return ($) => {
    $('.report-text-surround').find('table').remove()
    const reportText = $('.report-text-surround').text().trim() ||
      $('body').text().trim()

    const experience = { id, title, substanceList }
    fileAPI.experiences.write(experience, reportText)
    log(chalk`{bold.green Scraped} {bold.white #${id}} ${title} [${substanceList}] `)
    if (!reportText) {
      error(`ERR! No data found for #${id} [${substanceList}] ${title}`)
    } else {

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
