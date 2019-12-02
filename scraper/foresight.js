// foresight is called when init or list updates happen
// it should try to read the substances list and create routes

const fs = require('fs')
const { error } = require('../logs')
const { handleError } = require('./util')

module.exports = (function () {
  let keys = []
  let prefix = ''
  const foresight = function (parg) {
    prefix = parg
    try {
      const [, ...optionList] =
        fs.readFileSync(`${process.cwd()}/datfiles/${prefix}`)
          .toString()
          .split('%')[0]
          .split(/\r?\n/)
      optionList.pop()
      keys = optionList.map(option => {
        const [sval, ...rest] = option.split(/,(.+)/)
        const key = rest.join('')

        return { key, sval }
      })
    } catch (e) {
      error('ERR! Do not call on foresight unless scraper is initialized')
      handleError(e)
    }
  }

  foresight.wisdom = function (makePath) {
    const wisdom = {}
    keys.forEach(pair => {
      const { key: uKey, sval } = pair
      const key = uKey.toLowerCase()
      wisdom[`/${prefix}/${key}`] = makePath({ key, sval })
    })
    return wisdom
  }
  return foresight
})()
