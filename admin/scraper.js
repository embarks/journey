#!/usr/bin/env node
'use strict'
const rn = require('request')
const chalk = require('chalk')
const cheerio = require('cheerio')
const qs = require('qs')
const { BASE_URL } = require('./config')
const u = require('url')
const { log, handleError } = require('./util')

module.exports = (function scraper () {
  return {
    get: url => {
      const route = new u.URL(url, 'https://localhost').pathname

      const resolver = {
        '/ping': () => {
          rn.get(BASE_URL, function callback (err, res, body) {
            if (err) handleError(err)

            log(chalk.bold.blue('Beginning scrape...\n'))

            try {
              const $ = cheerio.load(body)
              log(chalk`Hello, {blue ${$('title').text()}}`)
            } catch (err) {
              handleError(err)
            }
          })
        }

      }

      return resolver[route]
    }
  }
})()
