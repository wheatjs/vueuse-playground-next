import { Express } from 'express'
import { nanoid } from 'nanoid'
import { FirebaseManager } from './firebase'

export async function registerRoutes(server: Express) {
  const firebase = new FirebaseManager()

  server.get('/:id', async(request, reply) => {
    const id: string = (request.params as any).id

    if (id.length !== 8) {
      return reply.send({
        message: 'Invalid Playground ID',
      })
    }

    const result = await firebase.GetData(id)
    if (!result) {
      return reply.send({
        message: 'Invalid Playground ID',
      })
    }

    return reply.send({
      data: result,
    })
  })

  server.post('/create', async(request, reply) => {
    const data = request.body
    const authToken = request.headers.authorization

    /**
     * When saving a playgroud, if the playground id is provided
     */
    if (typeof authToken !== 'undefined' && await firebase.authorize(authToken)) {
      return reply.send({
        message: 'Authed :)',
      })
    }

    return reply.send({
      message: 'Hey :)',
    })
  })
}

// import { Router } from 'express'
// import { nanoid } from 'nanoid'
// import firebase from './firebase'

// const dbRoutes = Router()

// dbRoutes.get('/:id', async(req, res) => {
//   try {
//     const id = req.params.id
//     if (id.length != 8)
//       throw new Error('Invalid ID')

//     const data = await firebase.GetData(id)
//     if (!data)
//       throw new Error('Invalid ID')

//     res.json(data)
//   }
//   catch (err) {
//     res.json({
//       success: false,
//       error: err,
//     })
//   }
// })

// dbRoutes.post('/store', async(req, res) => {
//   try {
//     // TODO: validate data
//     const data = req.body
//     const id = nanoid(8)

//     await firebase.StoreData(id, data)
//     res.json({
//       success: true,
//     })
//   }
//   catch (err) {
//     return res.json({
//       success: false,
//       error: err,
//     })
//   }
// })

// export default dbRoutes
