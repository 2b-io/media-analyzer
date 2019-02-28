import io from 'socket.io-client'
import 'elements/contact-form/auto-height-textarea'

const listenSocket = () => {
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

  if (REPORT.progress.length) {
    const { progress } = REPORT
    const { message, step, total } = progress[ progress.length -1 ]
    const percentProgress = (step * 100) / total
    document.getElementById('progress-bar').style.width = `${ Math.round(percentProgress) }%`
    document.getElementById('progress-message').innerHTML = `Analyzing... ${ Math.round(percentProgress) }% complete`
  }

  socket.on('analyze:progress', (data) => {
    console.log('data.payload',  data.payload)

    const { message, step, total } = data.payload.message
    const { error } = data.payload
    const percentProgress = (step * 100) / total

    document.getElementById('progress-bar').style.width = `${ Math.round(percentProgress) }%`
    document.getElementById('progress-message').innerHTML = `Analyzing... ${ Math.round(percentProgress) }% complete`

    if (message === 'Finished!' && !error) {
      location.reload()
    }
  })

  socket.on('analyze:failure', (data) => {
    socket.disconnect()
    document.getElementById('progress-message').innerHTML = 'An error happens, please try again later...'
  })
}

const handleTabs = () => {
  if (!REPORT.finish) {
    return
  }

  document.getElementById('tab-mobile').addEventListener('click', () => {
    document.getElementById('report-mobile').style.display = 'grid'
    document.getElementById('report-desktop').style.display = 'none'
    document.getElementById('tab-mobile').className = 'elements-tab-active'
    document.getElementById('tab-desktop').className = 'elements-tab'
  })

  document.getElementById('tab-desktop').addEventListener('click', () => {
    document.getElementById('report-desktop').style.display = 'grid'
    document.getElementById('report-mobile').style.display = 'none'
    document.getElementById('tab-desktop').className = 'elements-tab-active'
    document.getElementById('tab-mobile').className = 'elements-tab'
  })
}

window.addEventListener('load', () => {
  listenSocket()

  handleTabs()
})
