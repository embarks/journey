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
    writeFile: jest.fn(),
    appendFile: jest.fn()
  }))

  const { reportListConsumer } = require('./consumers')
  const { ReportListBody100 } = require('./test-util')
  const { writeFile, appendFile } = require('fs')
  const consume = reportListConsumer({
    substance: 'lsd',
    pageInfo: { total: 100, start: 0, max: 100, hasNext: false }
  })

  const $ = cheerio.load(ReportListBody100)
  consume($)
  expect(typeof writeFile.mock.calls[0][1]).toBe('string')
  expect(appendFile.mock.calls[0][1]).toBe('\n%')
  done()
})
