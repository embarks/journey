#!/usr/bin/env node
'use strict'
const chalk = require('chalk')
const sx = require('./scraper')
const { log, error } = require('./logs')
const { isInitialized } = require('./scraper/util')

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
      const settings = sx(`/substances/${substance}`)
      if (typeof settings === 'function') {
        await settings()
      } else return
      const experiences = sx(`/experiences/${substance}`)
      await experiences()
      log(chalk`{bgBlack.bold.white ${substance}} {bold DONE!}`)
    }
  )
  .command('?',
    'list all the substances',
    {},
    argv => {
      log('substances', argv)
    }
  )
  .demandCommand()
  .help()
  .argv

process.on('exit', function (code) {
  return log(`exiting with code ${code}`)
})

async function caffeine () {
  const caffeineSettings = sx('/substances/caffeine')
  await caffeineSettings()

  const caffeineExperiences = sx('/experiences/caffeine')
  await caffeineExperiences()

  const toadVenomSettings = sx('/substances/toad-venom')
  await toadVenomSettings()
}

// caffeine()
