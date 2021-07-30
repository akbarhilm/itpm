const express = require('express');
const router = express.Router();
const pengguna = require('../services/pengguna');

router.get('/pengguna/nik', async (req, res, next) => {
    try {
       
        const rows = await pengguna.find({ nik: req.user.data.nik,nama:req.user.data.nama });
        if (rows.length !== 0) {
           
            res.status(200).json(rows[0]);
        } else {
            res.status(200).json({});
        }
    } catch (err) {
        console.error(err)
        next(err)
    }
})

router.get('/pengguna/proyek/nik', async (req, res, next) => {
    try {
       
        const rows = await pengguna.findPenggunaProyek({ nik: req.user.data.nik  });
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



router.get('/pengguna/otoritas/nik', async (req, res, next) => {
    try {
       
        const rows = await pengguna.findPenggunaOtoritas({ nik: req.user.data.nik  });
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

router.get('/pengguna', async (req, res, next) => {
    try {
        const rows = await pengguna.find()
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

module.exports = router