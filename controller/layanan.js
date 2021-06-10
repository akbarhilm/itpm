const express = require('express');
const router = express.Router();
const layanan = require('../services/layanan');

router.get('/layanan', async (req, res, next) => {
    try {
       
        const rows = await layanan.find();
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

router.post('/layanan/tambah', async (req, res, next) => {
    try {
        const params = req.body
        params.identry = req.user.data.nik
        const rows = await layanan.add(params);
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