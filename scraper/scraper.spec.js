jest.mock('./config', () => ({
  BASE_URL: 'https://bobloblaw.law.blog'

}))

beforeEach(() => {
  jest.resetModules()
})

test('say hello', () => {
  jest.doMock('./util', () => {
    const util = jest.requireActual('./util')
    const $ = require('cheerio').load('<title>Erowid</title>')
    return {
      ...util,
      oaty: jest.fn((url, fn) => {
        fn($)
      })
    }
  })
  jest.doMock('../logs', () => {
    return {
      log: jest.fn(console.log)
    }
  })

  const scraper = require('.')
  const { oaty } = require('./util')
  const { log } = require('../logs')
  const { BASE_URL } = require('./config')

  const ping = scraper('/ping')
  ping()
  expect(oaty.mock.calls[0][0]).toEqual(BASE_URL)
  expect(log).toHaveBeenCalledTimes(2)
})

test('initialize', () => {
  jest.doMock('./util', () => {
    const util = jest.requireActual('./util')
    const $ = require('cheerio').load(
      `<select name="S1">
        <option value="2">LSD</option>
        <option value="1">Cannabis</option>
      </select>`
    )
    return {
      ...util,
      oaty: jest.fn((url, fn) => {
        fn($)
      }),
      log: jest.fn(console.log)
    }
  })
  jest.doMock('fs', () => ({
    openSync: jest.fn(),
    closeSync: jest.fn(),
    accessSync: jest.fn(),
    constants: {
      R_OK: true,
      W_OK: true
    },
    mkdirSync: jest.fn(),
    createWriteStream: jest.fn(() => ({
      write: jest.fn(),
      end: jest.fn()
    }))
  }))

  const scraper = require('.')
  const { oaty } = require('./util')
  const { BASE_URL, XP_BASE_PATH } = require('./config')
  const { createWriteStream } = require('fs')
  const write = jest.fn()
  const end = jest.fn()
  createWriteStream.mockReturnValue({ write, end })

  const initialize = scraper('/initialize')
  initialize()
  expect(write.mock.calls[0][0]).toEqual('2,LSD\n')
  expect(write.mock.calls[1][0]).toEqual('1,Cannabis')
  expect(end).toHaveBeenCalledWith('\n%')
  expect(oaty.mock.calls[0][0]).toEqual(`${BASE_URL}/${XP_BASE_PATH}`)
})
