const express = require('express');
const router = express.Router();
const charter = require('../services/charter');

router.get('/charter', async (req, res, next) => {
    try {
       
        const rows = await aplikasi.find({id:req.query.id});
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

router.post('/charter/tambah', async (req, res, next) => {
    try {
        const params = req.body
        params.identry = req.user.data.nik
        const rows = await charter.add(params);
        //console.dir(rows)
        
            res.status(200).json(rows);
        
    } catch (err) {
        console.error(err)
        next(err)
    }
})