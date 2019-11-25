const $ = require('cheerio')
const r = require('request')

const BASE_URL = 'https://www.erowid.org/'

r.get(BASE_URL, function (err, res, body) {
  console.log('error:', err) // Print the error if one occurred
  console.log('statusCode:', res && res.statusCode) // Print the response status code if a response was received
  console.log('body:', body) // Print the HTML for the Google homepage.
})
