#!/usr/bin/env node
'use strict'
const chalk = require('chalk')
const inquirer = require('inquirer')
const sx = require('./scraper')
const { log, error } = require('./logs')
const { isInitialized } = require('./scraper/util')

async function scrape (substance) {
  const settings = sx(`/substances/${substance}`)
  if (typeof settings === 'function') {
    await settings()
  } else return
  const experiences = sx(`/experiences/${substance}`)
  await experiences()
}

require('yargs') // eslint-disable-line
  .command('up', 'initialize or update the substance list', {},
    async () => {
      try {
        let update = sx('/initialize')
        if (isInitialized()) {
          update = sx('/cat')
        }
        await update()
      } catch (e) {
        error('ERR! update command failed')
        throw e // preserve stack
      }
      log(chalk`{bold DONE!} Successfully initialized.`)
    })
  .command(['$0', '<SUBSTANCE> [options]'],
    'scrape experiences for the specified substance',
    {},
    async ({ _ }) => {
      const [substance] = _
      if (!substance) {
        error(chalk`{bold.red ERR!} No substance provided. Specify --help for available commands.`)
        return
      }
      await scrape(substance)
      log(chalk`{bgBlack.bold.white ${substance}} {bold DONE!}`)
    }
  )
  .command('?',
    'list all the substances',
    {},
    argv => {
      inquirer.prompt([
        {
          type: 'list',
          name: 'substance',
          choices: sx('/substances').all
        }
      ]).then(async ({ substance }) => {
        await sx(substance)()
      })
    }
  )
  .demandCommand()
  .help()
  .argv

process.on('exit', function (code) {
  return log(`exiting with code ${code}`)
})
