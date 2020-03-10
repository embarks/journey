const fs = require('fs')
const ic = require('iconv-lite')
const sanitize = require('sanitize-filename')

const DATFILES = `${process.cwd()}/datfiles`
const reportsDir = `${DATFILES}/reports/`
const substanceFile = `${DATFILES}/substances`

const fn = (function () {
  let filename
  const lstPtrn = /^\[(.*?)\]/
  const idPtrn = /^#(\d*?) \[/

  function filenames (fn) {
    filename = fn
    return filenames
  }

  const id = () => {
    return filename
      .match(idPtrn).shift()
      .match(/(\d+)/).shift()
  }
  const list = () => {
    const id = filenames.id()
    const list = filename
      .substring(id.length + 1, filename.length)
      .trim()
      .match(lstPtrn)
      .shift()

    return list.substring(1, list.length - 1)
  }

  const format = ({ id, substanceList, title }) => {
    return `#${id} [${substanceList}] ${title}`
  }

  filenames.id = id
  filenames.list = list
  filenames.format = format

  return filenames
})()

function decode (data) {
  return ic.decode(Buffer.from(data, 'latin1'), 'windows1252')
}

module.exports = {
  DATFILES,
  reportsDir,
  substanceFile,
  write: {
    substances: ({ rows: data }) => {
      const rows = data.map(({ name, sval }) => {
        return `${sval},${name}`
      })
      rows.push('%')
      fs.writeFileSync(substanceFile, decode(rows.join('\n')))
    },
    reports: ({ substance, rows, isFirstPage, isFinalPage }) => {
      const OP = isFirstPage ? 'writeFileSync' : 'appendFileSync'
      const SF = `${DATFILES}/${substance}`

      const data = decode(rows.map(({ id, title, substanceList }) => `${id},"${title}","${substanceList}"`).join('\n'))

      fs[OP](SF, `${data}\n`)

      if (isFinalPage) {
        fs.appendFileSync(SF, '%')
      }
    },
    experiences: ({ experience }) => {
      const { id, title, substanceList, report } = experience
      const filename = fn.format({ id, title, substanceList })
      const datfile = `${reportsDir}${sanitize(filename)}`
      fs.writeFileSync(
        datfile,
        decode(report)
      )
    },
    stats: ({ stat, substance, content }) => {
      fs.writeFileSync(
        `${DATFILES}/${substance}.${sanitize(stat)}.stat`,
        content
      )
    }
  },
  read: {
    substances: () => {
      const optionList = fs.readFileSync(substanceFile)
        .toString()
        .split('%')[0]
        .split(/\r?\n/)
      optionList.pop()

      const keys = optionList.map(option => {
        const [sval, ...rest] = option.split(/,(.+)/)
        const key = rest.join('')
          .toLowerCase().trim()
          .replace(/-|\s-\s/g, ' ')
          .replace(/(\s|\/)/g, '-')
        return [key, sval]
      })

      return keys
    },
    reports: () => {
      const reports = fs.readdirSync(reportsDir)
      const values = reports.map((filename) => {
        const file = fn(filename)
        const id = file.id()
        const list = file.list()
        return { id, list, raw: filename }
      })
      return values
    },
    report: (id) => {
      return fs.readFileSync(`${reportsDir}${id}`).toString()
    },
    experiences: ({ substance }) => {
      const substanceFile = `${DATFILES}/${substance}`
      const data = fs.readFileSync(substanceFile)
      const rows = data
        .toString()
        .split('%')[0]
        .split(/\r?\n/)
      rows.pop()
      const values = rows.map((experience) => {
        const [id, oTitle, oSubstanceList] = experience.split(',"')
        const title = oTitle.replace('"', '')
        const substanceList = oSubstanceList.replace(/("|\[|\])/, '')
        return Object.freeze({ id, title, substanceList })
      })
      return values
    }
  }
}
