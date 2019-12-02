beforeEach(() => {
  jest.resetModules()
})

test('foresight', () => {
  jest.doMock('fs', () => {
    const fs = jest.requireActual('fs')
    return {
      ...fs,
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
  foresight('DAMN')
  expect(foresight.wisdom(
    ({ sval }) => sval
  )).toEqual(
    {
      '/DAMN/lsd': 'Yes.',
      '/DAMN/cannabis': 'Yes!',
      '/DAMN/opioids': 'YES!',
      '/DAMN/1-, 3-, or 4-drugs': 'TEST'
    }
  )
})
