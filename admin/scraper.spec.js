const scraper = require('./scraper')
const { log } = require('./util')
const request = require('request')
const { BASE_URL } = require('./config')

jest.mock('./config', () => ({
  BASE_URL: 'https://bobloblaw.law.blog'
}))

jest.mock('request', () => ({
  get: jest.fn((route, callback) => {
    callback()
  })
}))

jest.mock('cheerio', () => ({
  load: () => (title) => ({ text: () => 'Erowid' })
}))

jest.mock('./util', () => {
  return {
    handleError: console.error,
    log: jest.fn(console.log)
  }
})

test('should do something', () => {
  const ping = scraper.get('/ping')
  ping()
  expect(log).toHaveBeenCalledTimes(2)
  expect(request.get.mock.calls[0][0]).toEqual(BASE_URL)
})
