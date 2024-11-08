'use strict'

const axios = require('axios')
const cheerio = require('cheerio')
const _ = require('lodash')
const FileSystem = require('fs')

const URL =
  'https://science.unimelb.edu.au/students/scholarships/deans-honours-list-2024'

const fetchData = async () => {
  const response = await axios.get(URL)
  const html = response.data
  parseDOM(html)
}

const parseDOM = (html) => {
  const $ = cheerio.load(html)
  const data = {}
  const $lis = $('.accordion').children('li')
  // console.log($lis.length)
  $lis.each((i, li) => {
    const category = trimStr($(li).find('span').first().text().trim())
    // console.log(category)
    const $tables = $(li).find('table')
    // console.log($tables.length)
    $tables.each((j, table) => {
      let ths = $(table)
        .find('th')
        .map((k, th) => $(th).text().trim())
        .toArray()
      // console.log(ths)
      const $tds = $(table).find('td')
      // console.log($tds.length)
      let tds = []
      $tds.each((k, td) => {
        const cell = $(td)
          .html()
          .trim()
          .split('<br>')
          .map((name, m) => trimStr(name))
        // console.log(cell)
        tds.push(cell)
      })
      if (ths.length > 1 && ths[1] === '') {
        if (ths[0] === 'Graduate Diploma' || ths[0] === 'Master of Science') {
          ths = tds[0]
          tds = tds[1].map((td, k) => [td])
        } else {
          tds = [_.flatten(tds)]
          ths = [ths[0]]
        }
      }
      //   console.log(tds)
      tds.forEach((td, k) => {
        _.setWith(data, [category, ths[k]], td, Object)
      })
    })
  })

  console.log(data)
  dump(data)
}

const trimStr = (str) => {
  return _.join(
    str.split('\n').map((c) => c.trim()),
    ' '
  )
}

const dump = (data) => {
  FileSystem.writeFile('db.json', JSON.stringify(data), (error) => {
    if (error) throw error
  })
}

fetchData()
