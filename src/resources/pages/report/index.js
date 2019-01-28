import io from 'socket.io-client'

window.addEventListener('load', () => {
  const socket = io()

  socket.on('connect', () => {
    console.log('connected')
  })
})
