import io from 'socket.io-client'
const uri = 'http://localhost:2000/vartta'
// const socket = io(process.env.SOCKET_URL)
const socket = io(uri)

export default socket
