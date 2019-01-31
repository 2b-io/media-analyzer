import io from 'socket.io-client'

window.addEventListener('load', () => {
  if (REPORT.finish) {
    return
  }

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
    const message = data.payload.message
    const dom = document.createElement('div')

    dom.innerHTML = message
    dom.classList.add('progress-message')
    document.getElementById('progress').appendChild(dom)

    if (message === 'Finished!') {
      location.reload()
    }
  })
})
