const rn = require('request')
const cheerio = require('cheerio')
const error = console.error
const log = console.log

function handleError (err) {
  error(err)
  process.exit(err.code)
}

function oaty (url, consumer) {
  rn.get(url, (err, res, body) => {
    if (err) handleError(err)
    try {
      const $ = cheerio.load(body)
      consumer($)
    } catch (err) {
      handleError(err)
    }
  })
}

module.exports = {
  handleError,
  log,
  error,
  oaty
}
