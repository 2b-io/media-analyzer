import socket from 'socket.io'

const state = {
  socketServer: null
}

export default (server) => {
  if (!state.socketServer) {
    const socketServer = socket(server)

    socketServer.on('connect', (socket) => {
      console.log('A socket connected!')

      socket.on('disconnect', () => {
        console.log('A socket disconnected')
      })

      socket.on('data', (data) => {
        console.log('data', data)

        socket.join(data.payload.identifier, () => {
          socket.emit('data', {
            message: 'SUBSCRIPTION_ACCEPTED',
            payload: {
              identifier: data.payload.identifier
            }
          })
        })
      })

      socket.emit('data', {
        message: 'CONNECTION_ACCEPTED'
      })
    })

    state.socketServer = socketServer
  }

  return state.socketServer
}

export const getSocketServer = () => state.socketServer
