import socket from 'socket.io'

const state = {
  socketServer: null
}

export default (server) => {
  if (!state.socketServer) {
    state.socketServer = socket(server)
  }

  return state.socketServer
}
