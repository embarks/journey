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
            '2,LSD\n' +
            '1,Cannabis\n' +
            '3,Opioids\n' +
            '%'
          }
        }
      }
    }
  })

  const foresight = require('./foresight')

  expect(foresight.wisdom()).toEqual({})

  foresight()

  expect(foresight.wisdom(
    key => {
      if (key === 'LSD') return 'YES!'
      if (key === 'Cannabis') return 'Yes!'
      if (key === 'Opioids') return 'Yes.'
    }
  )).toEqual(
    { LSD: 'YES!', Cannabis: 'Yes!', Opioids: 'Yes.' }
  )
})
