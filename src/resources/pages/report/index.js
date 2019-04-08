import io from 'socket.io-client'
import 'elements/contact-form/auto-height-textarea'

import { parseProgress } from './parse-progress'

const showProgress = (current, finish) => {
  const progress = parseProgress(current, finish)

  document.getElementById('progress-bar').style.width = `${progress}%`
  document.getElementById('progress-message').innerHTML = `Analyzing... ${progress}% complete`
}

console.log(REPORT)

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

  if (REPORT.progress) {
    showProgress(REPORT.progress, FINISH)
  }

  socket.on('analyze:progress', (data) => {
    const { progress } = data.payload

    showProgress(progress, FINISH)

    if (progress === FINISH) {
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
