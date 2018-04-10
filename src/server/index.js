import boolean from 'boolean'
import ect from 'ect'
import express from 'express'
import http from 'http'
import mkdirp from 'mkdirp'
import mimeMatch from 'mime-match'
import nu from 'normalize-url'
import path from 'path'
import pretty from 'pretty-bytes'
import puppeteer from 'puppeteer'
import request from 'superagent'
import shortHash from 'shorthash'
import socket from 'socket.io'

const DESKTOP_UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/65.0.3325.181 Safari/537.36'
const MOBILE_UA = 'Mozilla/5.0 (iPhone; CPU iPhone OS 11_0 like Mac OS X) AppleWebKit/604.1.38 (KHTML, like Gecko) Version/11.0 Mobile/15A372 Safari/604.1'

const app = express()

const screenshotDir = path.join(__dirname, '../../screenshot')
mkdirp.sync(screenshotDir)

const viewDir = path.join(__dirname, './views')

const engine = ect({
  watch: true,
  root: viewDir,
  ext: '.ect'
})

app.set('view engine', 'ect')
app.engine('ect', engine.render)
app.set('views', viewDir)

app.use('/s', express.static(path.join(__dirname, '../../screenshot')))
app.use('/libs', express.static(path.join(__dirname, '../../node_modules')))

const server = http.Server(app)
const io = socket(server)
const reports = {}

io.on('connection', async (socket) => {
  console.log('[socket.io] an user connected')

  socket.on('disconnect', async () => {
    console.log('[socket.io] the user disconnected')
  })

  socket.on('request_analyze', async (msg) => {
    analyze(msg, socket.id)
  })
})

app.get('/', (req, res, next) => {
  res.render('index')
})

app.get('/reports/:tag', (req, res) => {
  const report = reports[req.params.tag]

  return report ?
    res.render('analyze', report) :
    res.redirect('/')
})

server.listen(3005, () => console.log('App started at: 3005'))

const log = (requester) => {
  let anchor

  return (info, finish) => {
    if (!finish) {
      anchor = Date.now()
    }

    console.log(info, finish ? `${Date.now() - anchor}ms` : '')

    io.to(requester).emit('analyze_progress', {
      info: info,
      time: finish ? Date.now() - anchor : null
    })
  }
}

const normalizeUrl = (protocol, domain) => (url) => {
  if (url.indexOf('/') === 0) {
    if (url.indexOf('//') === 0) {
      return `${protocol}${url}`
    }

    return `${protocol}//${domain}${url}`
  }

  return url
}

const optimize = async (imgs) => {
  console.time('Optimize')

  await Promise.all(
    imgs.map(img => {
      if (img.url.indexOf('https://server1.mn-cdn.com') === 0 ||
        img.url.indexOf('data:') === 0 ||
        img.contentType === 'image/svg+xml') {
        img.optimizedPath = img.url
        img.optimizedSize = img.size
        img.prettyOptimizedSize = '✓'

        return Promise.resolve()
      }

      let p = `https://server1.mn-cdn.com/u/test?url=${encodeURIComponent(img.url)}`

      if (img.imgTag && img.imgTag.shouldResize) {
        p = `${p}&w=${img.imgTag.displayed.width}&h=${img.imgTag.displayed.height}&m=crop`
      }

      return request
        .get(p)
        .then(res => {
          img.optimizedPath = p
          img.optimizedSize = parseInt(res.headers['content-length'], 10)
          img.prettyOptimizedSize = pretty(img.optimizedSize || 0)
        })
        .catch(error => {
          img.optimizedPath = img.url
          img.optimizedSize = img.size
          img.prettyOptimizedSize = 'N/A'
        })
    })
  )

  console.timeEnd('Optimize')

  return imgs
}

const analyze = async (data, requester) => {
  const updateProgress = log(requester)

  const url = nu(data.url, {
    stripWWW: false
  })

  const reportTag = shortHash.unique(url)

  const report = reports[reportTag]

  if (report && report.created + (5 * 60e3) > Date.now()) {
    updateProgress('Cache hit')

    io.to(requester).emit('analyze_complete', {
      reportLink: `/reports/${reportTag}`
    })

    return
  }

  const viewport = {
    // width: 375,
    width: parseInt(data.w || 1280, 10),
    height: parseInt(data.h || 900, 10),
    isMobile: boolean(data.m)
  }

  const ua = boolean(data.m) ? MOBILE_UA : DESKTOP_UA

  // collector
  const resources = {}

  updateProgress(`GET ${url} ...`)

  let browser

  try {
    browser = await puppeteer.launch({
      // headless: f,
      args: [ '--no-sandbox', '--disable-dev-shm-usage' ]
    })

    const page = await browser.newPage()

    await page._client.on('Network.dataReceived', async (event) => {
      const req = page._networkManager._requestIdToRequest.get(event.requestId)

      if (!req) {
        return
      }

      const url = req.url()

      if (url.startsWith('data:')) {
        return
      }

      const length = event.dataLength

      if (!(url in resources)) {
        resources[url] = { url }
      }

      resources[url].size = (resources[url].size || 0) + length
    })

    await page.on('response', async (res) => {
      const req = res.request()

      const url = req.url()

      if (url.startsWith('data:')) {
        return
      }

      if (!(url in resources)) {
        resources[url] = { url }
      }

      resources[url].status = res.status()
      resources[url].contentType = (res.headers()['content-type'] || '')
        .split(';').shift()
    })

    await page.setViewport(viewport)
    await page.setUserAgent(ua)
    const response = await page.goto(url, {
      waitUntil: 'networkidle0',
      timeout: 2 * 60 * 1000 // 2 minutes
    })

    updateProgress(`GET ${url}... ${response.status()}`, true)

    updateProgress(`Capture screenshot...`)

    const screenshot = `${reportTag}.jpeg`

    await page.screenshot({
      path: path.join(screenshotDir, screenshot),
      fullPage: true
    })

    updateProgress('Capture screenshot... done', true)

    updateProgress(`Inspect DOM...`)

    const location = await page.evaluate(() => ({
      hostname: location.hostname,
      protocol: location.protocol
    }))

    const normalize = normalizeUrl(location.protocol, location.hostname)

    const imgTags = (
      await page.evaluate(() => {
        const imgs = document.querySelectorAll('img')

        return [].slice.call(imgs).map(function(img) {
          return {
            natural:{
              width: img.naturalWidth,
              height: img.naturalHeight
            },
            displayed: {
              width: img.clientWidth,
              height: img.clientHeight
            },
            src: img.getAttribute('src')
          }
        })
      })
    )
    .filter(Boolean)
    .filter(img => {
      return img.src && img.natural.width > 0 && img.natural.height > 0 && img.displayed.width > 0 && img.displayed.height > 0
    })
    .map(img => ({
      ...img,
      shouldResize: (img.natural.width * img.natural.height) > (img.displayed.width * img.displayed.height),
      url: normalize(img.src.trim())
    }))
    .reduce((tags, img) => {
      const { url } = img
      const existed = tags[url]

      if (!existed) {
        tags[url] = img
      } else {
        if ((img.displayed.width * img.displayed.height) > (existed.displayed.width * existed.displayed.height)) {
          tags[url] = img
        }
      }

      return tags
    }, {})

    const images = Object.values(resources).reduce((images, resource) => {
      const { url, contentType }  = resource

      if (mimeMatch(contentType, 'image/*')) {
        images[url] = {
          ...resource,
          prettySize: pretty(resource.size),
          imgTag: imgTags[url],
          css: !(url in imgTags),
          percent: 100
        }
      }

      return images
    }, {})

    updateProgress(`Inspect DOM... done`, true)

    updateProgress(`Optimize...`)

    const imgs = await optimize(Object.values(images))

    updateProgress(`Optimize... done`, true)

    const totalSize = imgs.reduce((size, imgs) => size + (imgs.size || 0), 0)
    const totalOptimizedSize = imgs.reduce((size, imgs) => size + (imgs.optimizedSize || 0), 0)

    imgs.forEach(img => {
      img.percent = img.size ?
        (img.optimizedSize / img.size) * 100 : 100
    })

    reports[reportTag] = {
      resources,
      imgs,
      screenshot: `/s/${screenshot}`,
      prettyTotalSize: pretty(totalSize || 0),
      prettyTotalOptimizedSize: pretty(totalOptimizedSize || 0),
      percent: totalSize ?
       (totalOptimizedSize / totalSize) * 100 : 100,
      created: Date.now()
    }

    io.to(requester).emit('analyze_complete', {
      reportLink: `/reports/${reportTag}`
    })
  } finally {
    if (browser) {
      await browser.close()
    }
  }
}
