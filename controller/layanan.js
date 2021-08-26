const express = require('express');
const router = express.Router();
const layanan = require('../services/layanan');
const map = require('../util/errorHandling')

router.get('/layanan', async (req, res, next) => {
    try {
       
        const rows = await layanan.find();
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

router.get('/layanan/unused',async (req,res,next)=>{
    try{
        const param ={}
       
            param.idproj = req.query.idproj || false
        
        const rows = await layanan.findUnsed(param);
        if (rows.length !== 0) {
            res.status(200).json(rows);
        } else {
            res.status(200).json({});
        }
    }catch (err) {
        console.error(err)
        next(err)
    }
})
router.post('/layanan/tambah', async (req, res, next) => {
    try {
        const params = req.body
        params.identry = req.user.data.nik
        const rows = await layanan.add(params);
        if (rows.length != 0) {
            res.status(200).json(rows);
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