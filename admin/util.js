const error = console.error
const log = console.log

function handleError (err) {
  error(err)
  process.exit(err.code)
}

module.exports = {
  handleError,
  log,
  error
}
