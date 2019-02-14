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

function openTab (e, tabName) {
  document.getElementById('report-mobile').style.display = "grid";
  document.getElementById('report-desktop').style.display = "none";
  document.getElementById('element-tab-mobile').className = "elements-tab-active";
  document.getElementById('element-tab-desktop').className = "elements-tab";

  if (tabName === 'report-desktop') {
    document.getElementById('report-desktop').style.display = "grid";
    document.getElementById('report-mobile').style.display = "none";
    document.getElementById('element-tab-desktop').className = "elements-tab-active";
    document.getElementById('element-tab-mobile').className = "elements-tab";
  }
}
