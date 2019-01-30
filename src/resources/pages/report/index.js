import io from 'socket.io-client'

window.addEventListener('load', () => {
  const socket = io()

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
    document.getElementById('log-screen').innerHTML = data.payload.message
  })
})
