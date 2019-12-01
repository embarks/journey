// foresight is called when init or list updates happen
// it should try to read the substances list and create routes

const fs = require('fs')
const { error } = require('../logs')
const { handleError } = require('./util')

module.exports = (function () {
  let keys = []
  const foresight = function () {
    try {
      const [, ...optionList] =
        fs.readFileSync(`${process.cwd()}/datfiles/substances`)
          .toString()
          .split('%')[0]
          .split('\n')

      keys = optionList.map(option => {
        const [, ...rest] = option.split(',')
        const key = rest.join('')
        return key
      }).filter(Boolean)
    } catch (e) {
      error('ERR! Do not call on foresight unless scraper is initialized')
      handleError(e)
    }
  }

  foresight.wisdom = function (resolve) {
    const wisdom = {}
    keys.forEach(key => {
      wisdom[key] = resolve(key)
    })
    return wisdom
  }
  return foresight
})()
