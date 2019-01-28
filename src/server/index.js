import http from 'http'

import createExpressServer from 'express-server'
import createSocketServer from 'socket-server'
import config from 'infrastructure/config'

const main = () => {
  const app = createExpressServer()
  const httpServer = http.Server(app)

  // integrate with socket.io
  createSocketServer(httpServer)

  httpServer.listen(config.port, () => {
    console.log(`App started at :${ config.port }`)
  })
}

main()
