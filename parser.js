const fileAPI = require('./fileAPI')

module.exports = (function () {
  let substance
  const dict = {}
  const keys = []

  function validate (token) {
    return /\w{2,}/.test(token)
  }

  function increment (word) {
    if (!dict[word]) {
      dict[word] = 1
      keys.push(word)
      // Otherwise just increment its count
    } else {
      dict[word]++
    }
  }

  function countWords () {
    const files = fileAPI.read.reports()
      .reduce((acc, curr) => {
        const { id, raw } = curr
        return { ...acc, [id]: raw }
      }, {})
    const experiences = fileAPI.read.experiences({ substance })

    experiences.forEach(({ id }) => {
      const file = files[id]
      if (typeof file === 'undefined') {
        throw new Error(`scrape ${substance} data before attempting to parse`)
      } else {
        const data = fileAPI.read.report(file)
        const tokens = data.split(/\W+/)
        for (var i = 0; i < tokens.length; i++) {
          // Lowercase everything to ignore case
          var token = tokens[i].toLowerCase()
          if (validate(token)) {
            // Increase the count for the token
            increment(token)
          }
        }
      }
    })
    fileAPI.write.stats(
      {
        stat: 'words',
        substance,
        content: JSON.stringify(dict, null, 2)
      })
  }

  const parser = (vars) => {
    substance = vars.substance
    return {
      countWords
    }
  }
  return parser
})()
