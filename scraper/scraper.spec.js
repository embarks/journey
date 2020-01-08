
jest.mock('./config', () => ({
  BASE_URL: 'https://bobloblaw.law.blog',
  XP_BASE_PATH: 'blogs',
  XP_VAULT_PATH: 'dogs.ogg'
}))

beforeEach(() => {
  jest.resetModules()
  jest.unmock('../logs')
  jest.unmock('./foresight')
  jest.unmock('./util')
  jest.unmock('./consumers')
  jest.unmock('fs')
})
describe('scraper', () => {
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
    expect(log).toHaveBeenCalledTimes(1)
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
      existsSync: jest.fn(),
      openSync: jest.fn(),
      closeSync: jest.fn(),
      accessSync: jest.fn(),
      constants: {
        R_OK: true,
        W_OK: true
      },
      mkdirSync: jest.fn(),
      writeFileSync: jest.fn()
    }))

    const { oaty } = require('./util')
    const { BASE_URL, XP_BASE_PATH } = require('./config')
    const { writeFileSync } = require('fs')
    const sx = require('.')

    const init = sx('/initialize')
    init()
    expect(writeFileSync).toHaveBeenCalledWith(`${process.cwd()}/datfiles/substances`, '2,LSD\n' + '1,Cannabis\n' + '%')
    expect(oaty.get.mock.calls[0][0]).toEqual(`${BASE_URL}/${XP_BASE_PATH}`)
  })

  test('substance', () => {
    jest.doMock('fs', () => ({
      mkdirSync: jest.fn(),
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
  test('get substance list', () => {
    jest.doMock('fs', () => ({
      readFileSync: jest.fn(() => {
        return '0,--nonce--\n1,Cannabis\n2,LSD\n%'
      }),
      mkdirSync: jest.fn()
    }))
    const foresight = require('./foresight')
    const spy = jest.spyOn(foresight, 'wisdom')
    const sx = require('.')
    const func = sx('/substances/lsd')
    const func420 = sx('/substances/cannabis')
    expect(func).toBeInstanceOf(Function)
    expect(func420).toBeInstanceOf(Function)
    expect(spy).toHaveBeenCalledTimes(1)
  })
  test('get experience settings from substance list', (done) => {
    jest.doMock('./util', () => {
      const util = jest.requireActual('./util')
      return {
        ...util,
        oaty: {
          get: jest.fn((URL, fn) => {
            fn('[test] scraper - experience')
          })
        }
      }
    })
    jest.doMock('./consumers', () => {
      return {
        experienceConsumer: jest.fn(() => {
          return () => {
            done()
          }
        })
      }
    })
    jest.doMock('fs', () => {
      const rest = jest.requireActual('fs')
      return {
        ...rest,
        readdirSync: jest.fn(() => []),
        readFileSync: jest.fn(() => {
          return Buffer.from('109504,"Before and After","LSD & Escitalopram (Lexapro)"\n106589,"Insight","LSD"\n108950,"Anxiety Nothingness and the Logic-Machine","LSD"\n108676,"Tripp on the Hill","MDMA, 1P-LSD & LSD"\n102840,"Colors of an LSD Sunrise","LSD"\n89368,"Kundalini and the Power of Love","LSD & Cannabis"\n103265,"A Very Psychedelic Vacation","LSD, Nitrous Oxide, 4-HO-DiPT & Cannabis"\n69875,"Tripping on the Paradisiac Brazilian Coast","LSD"\n107585,"At Last A Psychedelic Hike and More","LSD"\n98139,"Self-Deception Induced Nightmare","Suspected DOB (sold as LSD), Cannabis & Synthetic Cannabinoids"')
        }),
        accessSync: jest.fn(() => {
        })
      }
    })

    jest.useFakeTimers()
    const fs = require('fs')
    const consumers = require('./consumers')
    const sx = require('.')
    const doScrape = sx('/experiences/lsd')
    expect(doScrape).toBeInstanceOf(Function)
    expect(fs.readFileSync).not.toHaveBeenCalled()
    doScrape()
    expect(fs.readFileSync).toHaveBeenCalled()
    jest.runAllTimers()
    expect(consumers.experienceConsumer).toHaveBeenCalled()
  })
})
