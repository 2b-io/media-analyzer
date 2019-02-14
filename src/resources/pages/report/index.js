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
            identifier: REPORT.identifier
          }
        })

      case 'SUBSCRIPTION_ACCEPTED':
        console.log('subscription accepted')

        return
    }
  })

  socket.on('analyze:progress', (data) => {
    const message = data.payload.message

    if (message === 'Finished!') {
      location.reload()
    }
  })

  socket.on('analyze:failure', (data) => {
    const dom = document.createElement('div')

    dom.innerHTML = 'An error happens, please try again later...'
    dom.classList.add('progress-message')
    document.getElementById('progress').appendChild(dom)
  })
})
