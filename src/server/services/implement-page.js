import cheerio from 'cheerio'
import fs from 'fs-extra'
import mkdirp from 'mkdirp'
import path from 'path'

import config from 'infrastructure/config'

const pageContentDir = path.join(__dirname, '../../../page-content')
mkdirp.sync(pageContentDir)

const implement = async (html, reportTag, normalize) => {
  const $ = cheerio.load(html)

  $('img, link, script, a').each((index, element) => {
    const src = $(element).attr('src')
    const dataSrc = $(element).attr('data-src')

    // check tag img
    if (element.name === 'img' && src && !src.startsWith('data:')) {
      let originSrc = normalize(src)
      $(element).attr('src', `${ config.endpoint }/u?url=${ originSrc }`)
    }

    if (element.type === 'script' && src && src.startsWith('/')) {
      $(element).attr('src', normalize($(element).attr('src')))
    }

    if (dataSrc) {
      let originDataSrc = normalize(dataSrc)
      $(element).attr('data-src', `${ config.endpoint }/u?url=${ originDataSrc }`)
    }

    if ($(element).attr('href')) {
      $(element).attr('href', normalize($(element).attr('href')))
    }
  })

  await fs.outputFile(path.join(pageContentDir, `${ reportTag }.html`), $.html())
}

export default implement
