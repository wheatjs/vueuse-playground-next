import { Router } from 'express'
import { nanoid } from 'nanoid'
import firebase from './firebase'

const dbRoutes = Router()

dbRoutes.get('/:id', async(req, res) => {
  try {
    const id = req.params.id
    if (id.length != 8)
      throw new Error('Invalid ID')

    const data = await firebase.GetData(id)
    if (!data)
      throw new Error('Invalid ID')

    res.json(data)
  }
  catch (err) {
    res.json({
      success: false,
      error: err,
    })
  }
})

dbRoutes.post('/store', async(req, res) => {
  try {
    // TODO: validate data
    const data = req.body
    const id = nanoid(8)

    await firebase.StoreData(id, data)
    res.json({
      success: true,
    })
  }
  catch (err) {
    return res.json({
      success: false,
      error: err,
    })
  }
})

export default dbRoutes
