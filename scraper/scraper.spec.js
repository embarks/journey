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
    jest.unmock('fs')
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
  test('substance', () => {
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
  test('experience', (done) => {
    jest.doMock('fs', () => {
      const rest = jest.requireActual('fs')
      return {
        ...rest,
        readFile: jest.fn((url, cb) => {
          cb(undefined, Buffer.from('100\n102\n%'))
        }),
        accessSync: jest.fn(() => {
        })
      }
    })
    const fs = require('fs')
    const sx = require('.')
    const doScrape = sx('/experiences/lsd')
    expect(doScrape).toBeInstanceOf(Function)
    expect(fs.readFile).not.toHaveBeenCalled()
    doScrape()
    expect(fs.readFile).toHaveBeenCalled()
    done()
  })
  test('order of operations', () => {
    jest.doMock('fs', () => ({
      constants: {
        R_OK: true
      },
      mkdirSync: jest.fn(),
      accessSync: jest.fn((...args) => {
        console.log(`[test] fs.accessSync(${[...args].join(', ')})`)
        if ([
          `${process.cwd()}/datfiles/lsd`,
          `${process.cwd()}/datfiles/cannabis`,
          `${process.cwd()}/datfiles/toad-venom`
        ].includes(args[0])) {
        } else {
          throw Error(`[test] ERR accessSync(${[...args]})`)
        }
      }),
      readFileSync: jest.fn((...args) => {
        console.log(`[test] fs.readFileSync(${[...args].join(', ')}) -> '0,--nonce--\n1,Cannabis\n2,LSD\n3,Toad Venom\n%'`)
        return '0,--nonce--\n1,Cannabis\n2,LSD\n3,Toad Venom\n%'
      }),
      readFile: jest.fn((...args) => {
        console.log(`[test] fs.readFile(${[...args].join(', ')})`)
        if ([
          `${process.cwd()}/datfiles/lsd`,
          `${process.cwd()}/datfiles/cannabis`
        ].includes(args[0])) {
          args[1](undefined, Buffer.from('100\n102\n%'))
        } else {
          throw Error(`[test] ERR readFile(${[...args]})`)
        }
      })
    }))
    const foresight = require('./foresight')
    jest.spyOn(foresight, 'wisdom')
    jest.spyOn(foresight, 'experiences')
    const sx = require('.')
    expect(() => sx()).toThrow()
    expect(foresight.wisdom).toHaveBeenCalledTimes(0)

    expect(sx('/substances')).toBeInstanceOf(Function)
    expect(foresight.wisdom).toHaveBeenCalledTimes(1)

    expect(sx('/experiences/please-do-not-make-this-file')).toBeUndefined()
    expect(sx('/substances/please-do-not-make-this-route')).toBeUndefined()

    expect(sx('/experiences/lsd')).toBeInstanceOf(Function)
    expect(sx('/substances/lsd')).toBeInstanceOf(Function)
    expect(foresight.wisdom).toHaveBeenCalledTimes(1)

    expect(sx('/substances/cannabis')).toBeInstanceOf(Function)
    expect(foresight.wisdom).toHaveBeenCalledTimes(1)

    expect(sx('/experiences/cannabis')).toBeInstanceOf(Function)
    expect(sx('/substances/toad-venom')).toBeInstanceOf(Function)
    expect(foresight.wisdom).toHaveBeenCalledTimes(1)

    const sx2 = require('.')
    const foresight2 = require('./foresight')
    expect(sx2('/substances/lsd')).toBeInstanceOf(Function)
    expect(sx2('/substances/cannabis')).toBeInstanceOf(Function)
    expect(sx2('/experiences/toad-venom')).toBeInstanceOf(Function)

    // it should have only read the substances file once
    expect(foresight.wisdom).toHaveBeenCalledTimes(1)
    expect(foresight2.wisdom).toHaveBeenCalledTimes(1)
  })
})
