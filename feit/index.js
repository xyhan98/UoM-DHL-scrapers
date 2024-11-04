'use strict'

const axios = require('axios')
const cheerio = require('cheerio')
const _ = require('lodash')
const FileSystem = require('fs')

const URL =
  'https://eng.unimelb.edu.au/students/scholarships-prizes-and-awards/sap/deans-honours-award'

const fetchData = async () => {
  const response = await axios.get(URL)
  const html = response.data
  parseDOM(html)
}

const parseDOM = (html) => {
  const $ = cheerio.load(html)
  const data = {}
  const $boxes = $('div.sidebar-tabs__panel.box')
  //   console.log($boxes.length)
  $boxes.each((i, box) => {
    const year = $(box).find('h2').first().text().trim()
    // console.log(year)
    const $contents = $(box).find('.ct-accordion__wysiwyg_simple')
    // console.log($contents.length)
    $contents.each((j, content) => {
      const school = trimStr($(content).find('h2').first().text().trim())
      // console.log(school)
      const $lis = $(content).find('ul.accordion').children('li')
      $lis.each((k, li) => {
        const course = trimStr($(li).find('span').text().trim())
        // console.log(course)
        const $lis = $(li).find('ul').children('li')
        const students = $lis
          .map((m, li) => {
            const student = $(li).text()
            // console.log(student)
            return student
          })
          .toArray()
        // console.log(students)
        _.setWith(data, [year, school, course], students, Object)
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
