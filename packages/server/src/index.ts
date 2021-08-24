import { createServer } from 'http'
import { Server } from 'socket.io'
import App from 'express'
import cors from 'cors'
import { json } from 'body-parser'
import { registerRoutes } from './routes'
import { registerSockets } from './sockets'

export async function main() {
  const app = App()
  const server = createServer(app)

  app.use(cors({
    origin: '*',
  }))

  app.use(json())

  const io = new Server(server, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST'],
    },
  })

  await registerRoutes(app)
  await registerSockets(io)

  server.listen(process.env.port || 4000, () => {
    // eslint-disable-next-line no-console
    console.log(`Listening on http://localhost:${process.env.port || 4000}`)
  })
}
