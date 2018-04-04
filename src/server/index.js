import boolean from 'boolean'
import delay from 'delay'
import express from 'express'
import mime from 'mime'
import mimeMatch from 'mime-match'
import phantom from 'phantom'
import { URL } from 'url'

const DESKTOP_UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/65.0.3325.181 Safari/537.36'
const MOBILE_UA = 'Mozilla/5.0 (iPhone; CPU iPhone OS 11_0 like Mac OS X) AppleWebKit/604.1.38 (KHTML, like Gecko) Version/11.0 Mobile/15A372 Safari/604.1'

const app = express()

const waitForReady = async (page) => {
  const readyState = await page.evaluate(function() {
    return document.readyState
  })

  if (readyState === 'complete') { return }

  console.log('Webpage is loading...')
  await delay(100)

  await waitForReady(page)
}

app.get('/', (req, res, next) => {
  if (!req.query.url) {
    return res.sendStatus(400)
  }

  (async () => {
    const instance = await phantom.create()
    const page = await instance.createPage([
      '--ignore-ssl-errors=yes',
      '--debug=true'
    ])

    const images = []
    const css = []
    const js = []
    const viewportSize = {
      // width: 375,
      width: parseInt(req.query.w || 1280, 10),
      height: parseInt(req.query.h || 900, 10)
    }

    const ua = boolean(req.query.d) ? DESKTOP_UA : MOBILE_UA

    await page.property('viewportSize', viewportSize)
    await page.setting('userAgent', ua)
    await page.on('onResourceRequested', (requestData) => {
      const { url } = requestData

      const type = mime.getType(url)

      if (!type) return

      if (mimeMatch(type, 'image/*')) {
        // console.info('Requesting', url)
        images.push(url)
      } else if (mimeMatch(type, 'text/css')) {
        css.push(url)
      }
    })

    console.time('PageResponse')
    console.log(`GET ${req.query.url} ${ua}`)

    const status = await page.open(req.query.url)

    console.timeEnd('PageResponse')

    // report
    // await instance.exit()

    // const imgs = await page.evaluate(function() {
    //   const imgs = document.querySelectorAll('img')

    //   return Array.from(imgs).map(function(img) {
    //     return img.getAttribute('src')
    //   })
    // })

    // return res.json(imgs)

    console.time('Capture')

    await page.evaluate(function() {
      const style = document.createElement('style')
      const text = document.createTextNode('body { background: #fff }')

      style.setAttribute('type', 'text/css')
      style.appendChild(text)
      document.head.insertBefore(style, document.head.firstChild)
    })

    await waitForReady(page)

    if (req.query.delay) {
      await delay(parseInt(req.query.delay, 10))
    }

    await page.render('server/screenshot.png')

    console.timeEnd('Capture')

    await instance.exit()

    res.sendFile(__dirname + '/screenshot.png')
  })()
})

app.listen(3000, () => console.log('App started at: 3000'))
