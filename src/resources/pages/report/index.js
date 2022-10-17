import io from 'socket.io-client'
import 'elements/contact-form/auto-height-textarea'
import 'elements/header'

import { parseProgress } from './parse-progress'

const updateProgress = (current, finish) => {
  const steps = document.querySelectorAll('#progress-steps .step')

  Array.from(steps).forEach((e) => {
    const code = e.getAttribute('data-code')

    if (current & code) {
      e.querySelector('.succeed').style.display = 'block'
      e.querySelector('.processing').style.display = 'none'
      e.querySelector('.failed').style.display = 'none'
      e.setAttribute('data-status', 'succeed')
    }
  })

  const progress = parseProgress(current, finish)

  document.getElementById('progress-bar').style.width = `${progress}%`
  document.getElementById('progress-message').innerHTML = `Analyzing... ${progress}% complete`
}

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
    updateProgress(REPORT.progress, FINISH)
  }

  socket.on('analyze:progress', (data) => {
    const { progress } = data.payload

    updateProgress(progress, FINISH)

    if (progress === FINISH) {
      location.reload()
    }
  })

  socket.on('analyze:failure', (data) => {
    socket.disconnect()

    document.getElementById('progress-message').innerHTML = 'An error happens, please try again later...'

    const steps = document.querySelectorAll('#progress-steps .step')

    Array.from(steps).forEach((e) => {
      const status = e.getAttribute('data-status')

      if (status === 'processing') {
        e.querySelector('.succeed').style.display = 'none'
        e.querySelector('.processing').style.display = 'none'
        e.querySelector('.failed').style.display = 'block'
        e.setAttribute('data-status', 'failed')
      }
    })
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

const checkOptionOptimize = () => {
  if (!REPORT.optimize) {
    document.getElementById('switch-optimize').checked = true
    document.getElementById('switch-optimize').disabled = true
  }
}

const main = () => {
  listenSocket()

  handleTabs()
  checkOptionOptimize()
}

main()
