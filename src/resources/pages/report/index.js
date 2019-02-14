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
    console.log('data.payload',  data.payload)
    const { message, step, total } = data.payload.message
    const percentProgress = (step * 100) / total

    document.getElementById('progress-bar').style.width = `${ Math.round(percentProgress) }%`
    document.getElementById('progress-message').innerHTML = `Analyzing... ${ Math.round(percentProgress) }% complete`
    if (message === 'Finished!') {
      location.reload()
    }
  })

  socket.on('analyze:failure', (data) => {
    document.getElementById('progress-message').innerHTML = 'An error happens, please try again later...'
  })
})
