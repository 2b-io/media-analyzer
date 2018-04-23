import ect from 'ect'
import express from 'express'
import http from 'http'
import nu from 'normalize-url'
import path from 'path'
import shortHash from 'shorthash'
import socket from 'socket.io'

import config from 'infrastructure/config'
import analyze from 'services/analyze'
import reportService from 'services/report'

const { port } = config
const app = express()

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
app.use('/img', express.static(path.join(__dirname, '../../assets/img')))

const server = http.Server(app)
const io = socket(server)
const reports = {}

const log = (tag) => {
  let anchor

  return (info, finish) => {
    if (!finish) {
      anchor = Date.now()
    }

    console.log(info, finish ? `${Date.now() - anchor}ms` : '')

    io.emit('analyze_progress', {
      tag,
      info: info,
      time: finish ? Date.now() - anchor : null
    })
  }
}

io.on('connection', async (socket) => {
  console.log('[socket.io] an user connected')

  socket.on('disconnect', async () => {
    console.log('[socket.io] the user disconnected')
  })

  socket.on('request_analyze', async (msg) => {
    const url = nu(msg.url, { stripWWW: false })

    const data = {
      ...msg,
      url,
      tag: shortHash.unique(url)
    }

    socket.join(
      data.tag,
      () => socket.emit('accept_analyze_request', {
        url,
        tag: data.tag
      })
    )
  })

  socket.on('subscribe_analyze', async (msg) => {
    const logger = log(msg.tag)

    try {
      const reportLink = await analyze(msg, logger)

      io.emit('analyze_complete', {
        tag: msg.tag,
        reportLink
      })
    } catch (e) {
      logger(`Error happens ${e.toString()}`)

      io.emit('analyze_error', {
        tag: msg.tag
      })
    }
  })
})

app.get('/', (req, res, next) => {
  res.render('index')
})

app.get('/reports/:tag', async (req, res) => {
  const report = await reportService.get(req.params.tag)

  return report ?
    res.render('analyze', report.values) :
    res.redirect('/')
})

server.listen(port, () => console.log(`App started at: ${port}`))
