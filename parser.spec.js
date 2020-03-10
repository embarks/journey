beforeEach(() => {
  jest.unmock('./fileAPI')
})
describe('parser', () => {
  test('count words', () => {
    jest.doMock('./fileAPI', () => {
      return {
        read: {
          reports: jest.fn(() => {
            const values = [{ raw: '#123 testFilename.txt', id: '123' }]
            return values
          }),
          report: jest.fn(() => 'parser - count words - report output yes yes yes'),
          experiences: jest.fn(() => {
            const values = [{ id: '123', title: 'a wild ride!' }]
            return values
          })
        },
        write: { stats: jest.fn() }
      }
    })
    const parser = require('./parser')({ substance: 'test' })
    const fileAPI = require('./fileAPI')
    parser.countWords()
    expect(fileAPI.read.reports).toHaveBeenCalled()
    expect(fileAPI.read.experiences).toHaveBeenCalledWith({ substance: 'test' })
    expect(fileAPI.read.report).toHaveBeenCalledWith('#123 testFilename.txt')
    expect(fileAPI.write.stats).toHaveBeenCalledWith({
      content: JSON.stringify({
        parser: 1,
        count: 1,
        words: 1,
        report: 1,
        output: 1,
        yes: 3
      }, null, 2),
      stat: 'words',
      substance: 'test'
    }
    )
  })
})
