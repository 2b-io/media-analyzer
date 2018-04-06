import boolean from 'boolean'
import delay from 'delay'
import ect from 'ect'
import express from 'express'
import http from 'http'
import mkdirp from 'mkdirp'
import mime from 'mime'
import mimeMatch from 'mime-match'
import path from 'path'
import phantom from 'phantom'
import pretty from 'pretty-bytes'
import shortHash from 'shorthash'
import socket from 'socket.io'
import request from 'superagent'
import { URL } from 'url'

const DESKTOP_UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/65.0.3325.181 Safari/537.36'
const MOBILE_UA = 'Mozilla/5.0 (iPhone; CPU iPhone OS 11_0 like Mac OS X) AppleWebKit/604.1.38 (KHTML, like Gecko) Version/11.0 Mobile/15A372 Safari/604.1'

const TIMEOUT = 60e3
const app = express()

const screenshotDir = path.join(__dirname, '../../screenshot')
mkdirp.sync(screenshotDir)

const viewDir = path.join(__dirname, './views')

const engine = ect({
  watch: true,
  root: viewDir,
  ext: '.ect'
})

const reports = {}

app.set('view engine', 'ect')
app.engine('ect', engine.render)
app.set('views', viewDir)

app.use('/s', express.static(path.join(__dirname, '../../screenshot')))
app.use('/libs', express.static(path.join(__dirname, '../../node_modules')))

app.use((req, res, next) => {
  const timeout = setTimeout(() => {
    console.log(`Request ${req.url} timeout`)

    res.sendStatus(408)
  }, TIMEOUT)

  res.on('finish', () => {
    clearTimeout(timeout)
  })

  next()
})

const waitForReady = async (page, timeout) => {
  const readyState = await page.evaluate(function() {
    return document.readyState
  })

  if (readyState === 'complete') {
    await timeout.cancel()

    return
  }

  console.log('Wait for the webpage to finish rendering...')

  await Promise.race([
    delay(100),
    timeout
  ])

  await waitForReady(page, timeout)
}

const getHeaders = (img) => {
  return img.headers.reduce((result, header) => ({
    ...result,
    [header.name]: header.value
  }), {})
}

const getImageSize = (img) => {
  const headers = getHeaders(img)

  return headers['Content-Length']
}

const optimize = async (imgs) => {
  console.time('Optimize')

  await Promise.all(
    imgs.map(img => {
      if (img.url.indexOf('https://server1.mn-cdn.com') === 0 ||
        img.url.indexOf('data') === 0) {
        img.optimizedPath = img.url
        img.optimizedSize = img.size
        img.prettyOptimizedSize = '✓'

        return Promise.resolve()
      }

      let p = `https://server1.mn-cdn.com/u/test?url=${encodeURIComponent(img.url)}`

      if (img.canOptimized) {
        p = `${p}&w=${img.displayed.width}&h=${img.displayed.height}&m=crop`
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

const normalizeUrl = (protocol, domain) => (url) => {
  if (url.indexOf('/') === 0) {
    if (url.indexOf('//') === 0) {
      return `${protocol}${url}`
    }

    return `${protocol}//${domain}${url}`
  }

  return url
}

app.get('/', (req, res, next) => {
  res.render('index')
})

app.get('/reports/:tag', (req, res, next) => {
  const report = reports[req.params.tag]

  if (!report) {
    return res.redirect('/')
  }

  res.render('analyze', report)
})

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

const analyze = async (data, requester) => {
  const updateProgress = log(requester)

  const reportTag = shortHash.unique(data.url)

  const report = reports[reportTag]

  if (report && report.created + (5 * 60e3) > Date.now()) {
    updateProgress('Cache hit')

    io.to(requester).emit('analyze_complete', {
      reportLink: `/reports/${reportTag}`
    })

    return
  }

  let anchor

  const instance = await phantom.create([
    '--ignore-ssl-errors=yes'
  ])

  const page = await instance.createPage()

  const url = new URL(data.url)
  const viewportSize = {
    // width: 375,
    width: parseInt(data.w || 1280, 10),
    height: parseInt(data.h || 900, 10)
  }
  const ua = boolean(data.m) ? MOBILE_UA : DESKTOP_UA

  await page.property('viewportSize', viewportSize)
  await page.setting('userAgent', ua)

  const all = {}
  const images = {}

  await page.on('onResourceReceived', requestData => {
    const { url } = requestData
    const decodedUrl = decodeURIComponent(url)

    all[decodedUrl] = requestData

    const type = requestData.contentType ||
      mime.getType(new URL(decodedUrl).pathname)

    if (!type) {
      console.log(`Strange request ${requestData.url}`)

      return
    }

    if (mimeMatch(type, 'image/*')) {
      // console.info('Requesting', url)
      images[decodedUrl] = requestData
    }
  })

  updateProgress(`GET ${url.toString()} ...`)

  const status = await page.open(url.toString())

  updateProgress(`GET ${url.toString()} ${status}`, true)

  updateProgress(`Render...`)

  await page.evaluate(function() {
    const style = document.createElement('style')
    const text = document.createTextNode('body { background: #fff }')

    style.setAttribute('type', 'text/css')
    style.appendChild(text)
    document.head.insertBefore(style, document.head.firstChild)

    window.scrollTo(0, document.body.scrollHeight)
  })

  const timeout = delay.reject(5e3, 'timeout')

  try {
    await waitForReady(page, timeout)

    await timeout
  } catch (e) {
    if (e instanceof delay.CancelError) {
      updateProgress('Render... done', true)
    } else {
      updateProgress('Render takes longer than 5s... done', true)
    }
  }

  if (data.delay) {
    await delay(parseInt(data.delay, 10))
  }

  const screenshot = `${reportTag}.jpeg`

  mkdirp.sync(path.dirname(screenshot))

  await page.render(path.join(screenshotDir, screenshot), {
    quality: 50
  })

  updateProgress(`Captured /s/${screenshot}`)

  updateProgress(`Inspect DOM...`)

  const normalize = normalizeUrl(url.protocol, url.hostname)

  // report
  const imgTags = (await page.evaluate(function() {
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
  })).filter(Boolean).filter(img => {
    return img.src && img.natural.width > 0 && img.natural.height > 0 && img.displayed.width > 0 && img.displayed.height > 0
  }).map(img => {
    const u = normalize(img.src.trim())

    const data = images[u]

    if (!data) {
      console.log('====')
      console.log(u)
      console.log(img.src)
      console.log('====')

      return null
    }

    data.imgTag = true
    const size = parseInt(getImageSize(data), 10)

    return {
      ...img,
      ...data,
      size,
      prettySize: pretty(size || 0),
      canOptimized: img.natural.width > img.displayed.width || img.natural.height > img.displayed.height
    }
  }).filter(Boolean)

  const cssImages = Object.values(images)
    .filter(img => !img.imgTag)
    .map(img => {
      const size = parseInt(getImageSize(img), 10)

      return {
        ...img,
        size,
        prettySize: pretty(size || 0),
        natural: { width: 0, height: 0 },
        displayed: { width: 0, height: 0 }
      }
    })

  updateProgress(`Inspect DOM... done`, true)

  updateProgress(`Optimize...`)

  const imgs = await optimize([...imgTags, ...cssImages])

  updateProgress(`Optimize... done`, true)

  updateProgress(`Summary...`)

  const totalSize = imgs.reduce((size, imgs) => size + (imgs.size || 0), 0)
  const totalOptimizedSize = imgs.reduce((size, imgs) => size + (imgs.optimizedSize || 0), 0)

  imgs.forEach(img => {
    img.percent = img.size ?
      (img.optimizedSize / img.size) * 100 : 100
  })

  updateProgress(`Summary... done`, true)

  reports[reportTag] = {
    all,
    totalSize,
    totalOptimizedSize,
    screenshot: `/s/${screenshot}`,
    imgTags: imgs,
    imageData: images,
    prettyTotalSize: pretty(totalSize || 0),
    prettyTotalOptimizedSize: pretty(totalOptimizedSize || 0),
    percent: totalSize ?
     (totalOptimizedSize / totalSize) * 100 : 100,
    created: Date.now()
  }

  updateProgress(`Completed`)

  io.to(requester).emit('analyze_complete', {
    reportLink: `/reports/${reportTag}`
  })

  await instance.exit()
}

const server = http.Server(app)
const io = socket(server)

io.on('connection', async (socket) => {
  console.log('[socket.io] an user connected')

  socket.on('disconnect', async () => {
    console.log('[socket.io] the user disconnected')
  })

  socket.on('request_analyze', async (msg) => {
    analyze(msg, socket.id)
  })
})

server.listen(3005, () => console.log('App started at: 3005'))
