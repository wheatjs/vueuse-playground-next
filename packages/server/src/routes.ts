import { Router } from 'express';
import firebase from './firebase';
import { nanoid } from 'nanoid'

const dbRoutes = Router();

dbRoutes.get('/:id', async (req, res) => {
    try {
        var id = req.params.id;
        if(id.length != 8)
            throw 'Invalid ID';

        var data = await firebase.GetData(id);
        if(!data)
            throw 'Invalid ID';

        res.json(data);
    } catch (err) {
        res.json({
            success: false,
            error: err
        });
    }
});

dbRoutes.post('/store', async (req, res) => {
    try {
        // TODO: validate data
        var data = req.body;
        var id = nanoid(8);

        await firebase.StoreData(id, data);
        res.json({
            success: true
        })
    } catch (err) {
        return res.json({
            success: false,
            error: err
        });
    }
});

export default dbRoutes;