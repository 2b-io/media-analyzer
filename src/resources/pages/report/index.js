import io from 'socket.io-client'

window.addEventListener('load', () => {
  const socket = io.connect()

  socket.on('connect', () => {
    console.log('connected')
  })

  socket.on('data', (data) => {
    switch (data.message) {
      case 'CONNECTION_ACCEPTED':
        return socket.emit('data', {
          message: 'SUBSCRIBE_REPORT',
          payload: {
            identifier: Date.now()
          }
        })

      case 'SUBSCRIPTION_ACCEPTED':
        console.log('subscription accepted')

        return
    }
  })

  socket.on('progress', (data) => {
    // document.getElementById('log-screen').innerHTML = data.payload.message
  })

  socket.on('report optimized', (data) => {
    const { message } = data.payload
    const { optimizePageSize, optimizeMetrics, optimizeScreenshotPath } = message
    const {
      dnsLookup,
      tcpConnect,
      htmlLoadTime,
      request,
      response,
      fullTimeLoad
    } = optimizeMetrics

    document.getElementById('screenshot-optimized').src = optimizeScreenshotPath
    document.getElementById('optimizePageSize').innerHTML = optimizePageSize
    document.getElementById('dnsLookup-optimized').innerHTML = dnsLookup
    document.getElementById('tcpConnect-optimized').innerHTML = tcpConnect
    document.getElementById('htmlLoadTime-optimized').innerHTML = htmlLoadTime
    document.getElementById('request-optimized').innerHTML = request
    document.getElementById('response-optimized').innerHTML = response
    document.getElementById('fullTimeLoad-optimized').innerHTML = fullTimeLoad
  })

  socket.on('report origin', (data) => {
    const { message } = data.payload
    const { originPageSize, originMetrics, originScreenshotPath } = message
    const {
      dnsLookup,
      tcpConnect,
      htmlLoadTime,
      request,
      response,
      fullTimeLoad
    } = originMetrics

    document.getElementById('screenshot-origin').src = originScreenshotPath
    document.getElementById('originPageSize').innerHTML = originPageSize
    document.getElementById('dnsLookup-origin').innerHTML = dnsLookup
    document.getElementById('tcpConnect-origin').innerHTML = tcpConnect
    document.getElementById('htmlLoadTime-origin').innerHTML = htmlLoadTime
    document.getElementById('request-origin').innerHTML = request
    document.getElementById('response-origin').innerHTML = response
    document.getElementById('fullTimeLoad-origin').innerHTML = fullTimeLoad
  })
})
