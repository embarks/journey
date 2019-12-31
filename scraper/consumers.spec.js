const cheerio = require('cheerio')
const { getTotal } = require('./consumers')

beforeEach(() => {
  jest.resetModules()
  jest.unmock('fs')
})

test('get total number of reports', () => {
  const html = `<body>
  <center>
    <font size="5">Search Results</font><br>
    <font size="2"><b>(2445 Total)</b></font><br><br>
  </center>
  <hr>
  </body>`
  const $ = cheerio.load(html)
  const data = getTotal($)
  expect(data).toBe(2445)
})

test('consume a page of urls', (done) => {
  jest.doMock('fs', () => ({
    writeFile: jest.fn((file, data, uDone) => {
      console.log(`[test] writeFile(${[file, '{data}', 'fn done()'].join(', ')})`)
      uDone()
      done()
    }),
    appendFile: jest.fn()
  }))

  const { reportListConsumer } = require('./consumers')
  const { ReportListBody100, ReportListBody100Result } = require('./test-util')
  const { writeFile, appendFile } = require('fs')
  const consume = reportListConsumer({
    substance: 'lsd',
    pageInfo: { total: 100, start: 0, max: 100, hasNext: false }
  })

  const $ = cheerio.load(ReportListBody100)
  consume($)
  expect(writeFile.mock.calls[0][1]).toEqual(ReportListBody100Result)
  expect(typeof writeFile.mock.calls[0][1]).toBe('string')
  expect(appendFile.mock.calls[0][1]).toBe('%')
})

test('consume an experience report', (done) => {
  const { ReportBody } = require('./test-util')
  jest.doMock('fs', () => ({
    writeFile: jest.fn((file, data, callback) => {
      console.log(`[test] writeFile(${[file, '{data}', 'fn done()'].join(', ')})`)
      callback(undefined)
      done()
    })
  }))
  const { experienceConsumer } = require('./consumers')
  const $ = cheerio.load(ReportBody)
  const fs = require('fs')
  experienceConsumer({
    id: '1',
    substanceList: 'Ecstacy',
    title: 'An Unforgettable Ride!'
  })($)
  expect(fs.writeFile.mock.calls[0][0]).toEqual(`${process.cwd()}/datfiles/reports/#1 [Ecstacy] An Unforgettable Ride!`)
})
