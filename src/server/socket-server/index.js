import socket from 'socket.io'

export default (server) => {
  const io = socket(server)

  return io
}
