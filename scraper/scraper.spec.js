jest.mock('./config', () => ({
  BASE_URL: 'https://bobloblaw.law.blog',
  XP_BASE_PATH: 'blogs',
  XP_VAULT_PATH: 'dogs.ogg'
}))
describe('scraper', () => {
  beforeEach(() => {
    jest.resetModules()
    jest.unmock('../logs')
    jest.unmock('./foresight')
    jest.unmock('./util')
  })

  test('say hello', () => {
    jest.doMock('../logs', () => {
      return {
        error: jest.fn(console.error),
        log: jest.fn(console.log)
      }
    })
    jest.doMock('./util', () => {
      const util = jest.requireActual('./util')
      const $ = require('cheerio').load('<title>Erowid</title>')
      return {
        ...util,
        oaty: {
          get: jest.fn((url, fn) => fn($))
        }
      }
    })

    const scraper = require('.')
    const { oaty } = require('./util')
    const { log } = require('../logs')
    const { BASE_URL } = require('./config')

    const ping = scraper('/ping')
    ping()
    expect(oaty.get.mock.calls[0][0]).toEqual(BASE_URL)
    expect(log).toHaveBeenCalledTimes(2)
  })

  test('initialize', () => {
    jest.doMock('./foresight', () => {
      return (function () {
        const foresight = () => {}
        foresight.wisdom = () => ({})
        return foresight
      })()
    })
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
        oaty: {
          get: jest.fn((url, fn) => {
            fn($)
          })
        }
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

    const { oaty } = require('./util')
    const { BASE_URL, XP_BASE_PATH } = require('./config')
    const { createWriteStream } = require('fs')
    const scraper = require('.')
    const write = jest.fn()
    const end = jest.fn()
    createWriteStream.mockReturnValue({ write, end })

    const initialize = scraper('/initialize')
    initialize()
    expect(write.mock.calls[0][0]).toEqual('2,LSD\n')
    expect(write.mock.calls[1][0]).toEqual('1,Cannabis\n')
    expect(end).toHaveBeenCalledWith('%')
    expect(oaty.get.mock.calls[0][0]).toEqual(`${BASE_URL}/${XP_BASE_PATH}`)
  })

  test('substance', () => {
    jest.doMock('fs', () => ({
      readFileSync: jest.fn(() => {
        return '0,--nonce--\n1,Cannabis\n2,LSD\n%'
      })
    }))
    const sx = require('.')
    const func = sx('/substances/lsd')
    const func420 = sx('/substances/cannabis')
    expect(func).toBeInstanceOf(Function)
    expect(func420).toBeInstanceOf(Function)
  })
})
