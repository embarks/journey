
beforeEach(() => {
  jest.resetModules()
})

test('foresight.wisdom', () => {
  jest.doMock('fs', () => {
    const fs = jest.requireActual('fs')
    return {
      ...fs,
      mkdirSync: jest.fn(),
      readFileSync: () => {
        return {
          toString: () => {
            return '0,--- Nonce ---\n' +
            'Yes.,LSD\n' +
            'Yes!,Cannabis\n' +
            'YES!,Opioids\n' +
            'TEST,1-, 3-, or 4-Drugs\n' + '%'
          }
        }
      }
    }
  })
  const foresight = require('./foresight')

  expect(foresight.wisdom()).toEqual({})
  foresight('substances')
  expect(foresight.wisdom(
    ({ sval }) => sval
  )).toEqual(
    {
      '/substances/lsd': 'Yes.',
      '/substances/cannabis': 'Yes!',
      '/substances/opioids': 'YES!',
      '/substances/1-,-3-,-or-4-drugs': 'TEST'
    }
  )
})

describe('foresight.experiences', () => {
  test('returns a function', () => {
    jest.doMock('fs', () => {
      const fs = jest.requireActual('fs')
      return {
        ...fs,
        mkdirSync: jest.fn(),
        accessSync: () => {
        }
      }
    })
    const foresight = require('./foresight')
    expect(foresight.experiences()).toBeInstanceOf(Function)
  })
  test('reads a file', async (done) => {
    jest.doMock('fs', () => {
      const fs = jest.requireActual('fs')
      return {
        ...fs,
        accessSync: () => {
        },
        readFile: jest.fn((url, cb) => {
          cb(undefined, '113127\n97282,\n112686,\n83852,\n103280,\n101131,\n93660,\n96838,\n94784,\n94222\n%')
        })
      }
    })
    const foresight = require('./foresight')
    const fs = require('fs')
    const consumer = jest.fn((data) => {
      done()
    })
    const readThenScrape = foresight('experiences', 'cannabis')(consumer)
    expect(fs.readFile).not.toHaveBeenCalled()
    readThenScrape()
    expect(fs.readFile).toHaveBeenCalled()
    expect(consumer).toHaveBeenCalledWith('cannabis', [
      '113127', '97282,',
      '112686,', '83852,',
      '103280,', '101131,',
      '93660,', '96838,',
      '94784,', '94222'
    ])
  })
})
