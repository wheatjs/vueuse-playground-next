import Fastify, { FastifyInstance } from 'fastify'
import FastifyWebsocket from 'fastify-websocket'

async function start() {
  const server = Fastify({})

  /**
   * Register Plugins
   */
  server.register(FastifyWebsocket)

  server.get('/', { websocket: true }, (connection, request) => {
    connection.socket.on('message', message => {
      connection.socket.send('Hi From Server')
    })
  })

  server.listen(4000, (err) => {
    if (err) {
      server.log.error(err)
      process.exit(1)
    }
  })
}

start()