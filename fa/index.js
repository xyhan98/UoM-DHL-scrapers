'use strict'

const axios = require('axios')
const cheerio = require('cheerio')
const _ = require('lodash')
const FileSystem = require('fs')

const URL = 'https://arts.unimelb.edu.au/students/deans-honours-list'

const fetchData = async () => {
  const response = await axios.get(URL)
  const html = response.data
  parseDOM(html)
}

const parseDOM = (html) => {
  const $ = cheerio.load(html)
  const data = {}
  const $contents = $('div.ct-accordion__wysiwyg_simple.content-block')
  // console.log($contents.length)
  $contents.each((i, content) => {
    const course = $(content).find('h2').first().text().trim()
    // console.log(course)
    const $lis = $(content).find('ul.accordion').children('li')
    // console.log($lis.length)
    $lis.each((j, li) => {
      const subcategory = $(li).find('span').text().trim()
      // console.log(subcategory)

      const $strong = $(li).find('p strong').first()
      const top = $strong.text()

      let $ps
      if (course === 'Master of Cultural Materials Conservation') {
        $ps = $(li).find('div.accordion__hidden ul').last()
      } else if (course === 'Master of Leadership for Development') {
        $ps = $(li).find('div.accordion__hidden div').last()
      } else {
        $ps = $(li).find('div.accordion__hidden p').last()
      }
      // const $ps = $(li).find('div.accordion__hidden').children().last()
      let students = $ps
        .html()
        .trim()
        .split('<br>')
        .map((student, k) => trimStr(student))
      // console.log(students)

      if (top) {
        const topStudent = top.slice('Top Performing student: '.length)
        // console.log(topStudent)
        students = [topStudent, ...students]
        // console.log(students)
      }

      _.setWith(data, [course, subcategory], students, Object)
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
