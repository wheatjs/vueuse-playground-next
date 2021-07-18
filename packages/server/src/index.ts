import fastify from 'fastify'
import fastifyCors from 'fastify-cors'
import { Server } from 'socket.io'
import { registerRoutes } from './routes'
import { registerSockets } from './sockets'

export async function main() {
  const app = fastify({

  })

  app.register(fastifyCors, {
    origin: '*',
    methods: ['GET', 'POST', 'PUT'],
  })

  const io = new Server(app.server, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST'],
    },
  })

  // await registerRoutes(app)
  await registerSockets(io)

  app.listen(process.env.port || 4000, (e, address) => {
    console.log(`Listening on ${address}`) // eslint-disable-line no-console
  })
}
