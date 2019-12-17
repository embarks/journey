
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
            return '0,-all-\n' +
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
      '/substances': '0',
      '/substances/-all-': '0',
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
  test('reads a file', (done) => {
    jest.doMock('fs', () => {
      const fs = jest.requireActual('fs')
      return {
        ...fs,
        accessSync: () => {
        },
        readFile: jest.fn((url, cb) => {
          cb(undefined, '109504,"Before and After","LSD & Escitalopram (Lexapro)"\n106589,"Insight","LSD"\n108950,"Anxiety Nothingness and the Logic-Machine","LSD"\n108676,"Tripp on the Hill","MDMA, 1P-LSD & LSD"\n102840,"Colors of an LSD Sunrise","LSD"\n89368,"Kundalini and the Power of Love","LSD & Cannabis"\n103265,"A Very Psychedelic Vacation","LSD, Nitrous Oxide, 4-HO-DiPT & Cannabis"\n69875,"Tripping on the Paradisiac Brazilian Coast","LSD"\n107585,"At Last A Psychedelic Hike and More","LSD"\n98139,"Self-Deception Induced Nightmare","Suspected DOB (sold as LSD), Cannabis & Synthetic Cannabinoids"')
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
    expect(consumer).toHaveBeenCalledWith([{
      id: '109504',
      substanceList: 'LSD & Escitalopram (Lexapro)',
      title: 'Before and After'
    },
    {
      id: '106589',
      substanceList: 'LSD',
      title: 'Insight'
    },
    {
      id: '108950',
      substanceList: 'LSD',
      title: 'Anxiety Nothingness and the Logic-Machine'
    },
    {
      id: '108676',
      substanceList: 'MDMA, 1P-LSD & LSD',
      title: 'Tripp on the Hill'
    },
    {
      id: '102840',
      substanceList: 'LSD',
      title: 'Colors of an LSD Sunrise'
    },
    {
      id: '89368',
      substanceList: 'LSD & Cannabis',
      title: 'Kundalini and the Power of Love'
    },
    {
      id: '103265',
      substanceList: 'LSD, Nitrous Oxide, 4-HO-DiPT & Cannabis',
      title: 'A Very Psychedelic Vacation'
    },
    {
      id: '69875',
      substanceList: 'LSD',
      title: 'Tripping on the Paradisiac Brazilian Coast'
    },
    {
      id: '107585',
      substanceList: 'LSD',
      title: 'At Last A Psychedelic Hike and More'
    }])
  })
})
