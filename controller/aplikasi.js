const express = require('express');
const router = express.Router();
const aplikasi = require('../services/aplikasi');

router.get('/aplikasi', async (req, res, next) => {
    try {
       
        const rows = await aplikasi.find();
        if (rows.length !== 0) {
            res.status(200).json(rows);
        } else {
            res.status(404).json({});
        }
    } catch (err) {
        console.error(err)
        next(err)
    }
})

router.post('/aplikasi/tambah', async (req, res, next) => {
    try {
        const params = req.body
        params.identry = req.user.data.nik
        const rows = await aplikasi.add(params);
        if (rows == 1) {
            res.status(200).json({"code":200,"message":"berhasil tambah"});
        } else {
            res.json({});
        }
    } catch (err) {
        console.error(err)
        next(err)
    }
})

module.exports = router