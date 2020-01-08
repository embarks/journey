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

test('consume a page of urls', () => {
  jest.doMock('fs', () => ({
    writeFileSync: jest.fn((file, data) => {
      console.log(`[test] writeFileSync(${[file, '{data}', 'fn done()'].join(', ')})`)
    }),
    appendFileSync: jest.fn()
  }))

  const { reportListConsumer } = require('./consumers')
  const { ReportListBody100, ReportListBody100Result } = require('./test-util')
  const { writeFileSync, appendFileSync } = require('fs')
  const consume = reportListConsumer({
    substance: 'lsd',
    pageInfo: { total: 100, start: 0, max: 100, hasNext: false }
  })

  const $ = cheerio.load(ReportListBody100)
  consume($)
  expect(writeFileSync.mock.calls[0][1]).toEqual(ReportListBody100Result)
  expect(typeof writeFileSync.mock.calls[0][1]).toBe('string')
  expect(appendFileSync.mock.calls[0][1]).toBe('%')
})

test('consume an experience report', () => {
  const { ReportBody } = require('./test-util')
  jest.doMock('fs', () => ({
    writeFileSync: jest.fn((file, data, callback) => {
      console.log(`[test] writeFileSync(${[file, '{data}', 'fn done()'].join(', ')})`)
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
  expect(fs.writeFileSync.mock.calls[0][0]).toEqual(`${process.cwd()}/datfiles/reports/#1 [Ecstacy] An Unforgettable Ride!`)
})
