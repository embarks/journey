const fs = require('fs')
const ic = require('iconv-lite')
const sanitize = require('sanitize-filename')

const DATFILES = `${process.cwd()}/datfiles`
const reportsDir = `${DATFILES}/reports/`
const substanceFile = `${DATFILES}/substances`

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
      const fn = `#${id} [${substanceList}] ${title}`
      const datfile = `${reportsDir}${sanitize(fn)}`
      fs.writeFileSync(
        datfile,
        decode(report)
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
      return reports.map((filename) => {
        const idPtrn = /^#(\d*?) \[/
        const lstPtrn = /^\[(.*?)\]/
        const id = filename
          .match(idPtrn).shift()
          .match(/(\d+)/).shift()
        let list = filename
          .substring(id.length + 1, filename.length)
          .trim()
          .match(lstPtrn)
          .shift()
        list = list.substring(1, list.length - 1)
        return { id, list }
      })
    },
    experiences: ({ substance }) => {
      const substanceFile = `${DATFILES}/${substance}`
      const data = fs.readFileSync(substanceFile)
      const rows = data
        .toString()
        .split('%')[0]
        .split(/\r?\n/)
      rows.pop()
      return rows.map((experience) => {
        const [id, oTitle, oSubstanceList] = experience.split(',"')
        const title = oTitle.replace('"', '')
        const substanceList = oSubstanceList.replace(/("|\[|\])/, '')
        return Object.freeze({ id, title, substanceList })
      })
    }
  }
}
