import ect from 'ect'
import express from 'express'
import http from 'http'
import path from 'path'
import socket from 'socket.io'

import analyze from 'services/analyze'
import reportService from 'services/report'

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

const server = http.Server(app)
const io = socket(server)
const reports = {}

io.on('connection', async (socket) => {
  console.log('[socket.io] an user connected')

  socket.on('disconnect', async () => {
    console.log('[socket.io] the user disconnected')
  })

  socket.on('request_analyze', async (msg) => {
    const logger = log(socket.id)
    const reportLink = await analyze(msg, logger)

    if (!reportLink) {
      io.to(socket.id).emit('analyze_error', {})
      return
    }

    io.to(socket.id).emit('analyze_complete', {
      reportLink
    })
  })
})

app.get('/', (req, res, next) => {
  res.render('index')
})

app.get('/reports/:tag', async (req, res) => {
  const report = await reportService.get(req.params.tag)

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
