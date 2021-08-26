const express = require('express');
const router = express.Router();
const modul = require('../services/modul');
const map = require('../util/errorHandling')

router.get('/modul', async (req, res, next) => {
    try {
      
        const rows = await modul.find(req.query);
        if (rows.length !== 0) {
            res.status(200).json(rows);
        } else {
            res.status(200).json([]);
        }
    } catch (err) {
        console.error(err)
        next(err)
    }
})

router.get('/modul/:id', async (req, res, next) => {
    try {
       
        const rows = await modul.find({id:req.params.id});
        if (rows.length !== 0) {
            res.status(200).json(rows);
        } else {
            res.status(200).json({});
        }
    } catch (err) {
        console.error(err)
        next(err)
    }
})

router.post('/modul/tambah', async (req, res, next) => {
    try {
        const params = req.body
        params.identry = req.user.data.nik
        const rows = await modul.add(params);
        if (rows == 1) {
            res.status(200).json({"code":200,"message":"berhasil tambah"});
        } else {
            res.json({});
        }
    } catch (err) {
        const { errorNum } = err;
        const message = await map.map(errorNum)
        res.status(500).json({"code":errorNum,"message":message});
        next(err)
    }
})

module.exports = router