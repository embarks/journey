const fs = require('fs')
const chalk = require('chalk')
const { log } = require('../logs')

function sayHello ($) {
  log(chalk.bold.blue('Knock knock...\n'))
  log(chalk`Hello, {blue ${$('title').text()}}`)
}

function listSubstances ($) {
  log('Listing substances...')
  const w = fs.createWriteStream(`${process.cwd()}/datfiles/substances`)
  const substances = $('select[name="S1"]').children('option')
  substances.each(function (i, e) {
    const sval = $(e).val()
    const name = $(e).text()
    const isLast = i + 1 < substances.length
    w.write(`${sval},${name}${isLast ? '\n' : ''}`)
  })
  w.end('\n%')
  log(chalk`{bold.green Success}`)
}

function listReportLocs (substance) {
  return () => {
  }
}

module.exports = {
  sayHello,
  listSubstances,
  listReportLocs
}
