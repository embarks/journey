function countWords (substance) {
  /* Below is a regular expression that finds alphanumeric characters
       Next is a string that could easily be replaced with a reference to a form control
       Lastly, we have an array that will hold any words matching our pattern */
  var pattern = /\w+/g
  var string = 'I I am am am yes yes.'
  var matchedWords = string.match(pattern)

  /* The Array.prototype.reduce method assists us in producing a single value from an
      array. In this case, we're going to use it to output an object with results. */
  var counts = matchedWords.reduce(function (stats, word) {
    /* `stats` is the object that we'll be building up over time.
          `word` is each individual entry in the `matchedWords` array */
    if (typeof (stats[word]) !== 'undefined') {
      /* `stats` already has an entry for the current `word`.
              As a result, let's increment the count for that `word`. */
      stats[word] = stats[word] + 1
    } else {
      /* `stats` does not yet have an entry for the current `word`.
              As a result, let's add a new entry, and set count to 1. */
      stats[word] = 1
    }

    /* Because we are building up `stats` over numerous iterations,
          we need to return it for the next pass to modify it. */
    return stats
  }, {})
  console.log(counts)
}

module.exports = {
  countWords

}
