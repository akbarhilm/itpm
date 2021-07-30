const express = require('express');
const router = express.Router();
const risk = require('../services/risk');
const proj = require('../services/proyek')

router.get('/risk', async (req, res, next) => {
    try {

        const rows = await risk.find({
            idrisk: req.query.id
        });
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

router.get('/risk/:id', async (req, res, next) => {
    try {

        const rows = await risk.find({
            idproj: req.params.id
        });
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

router.post('/risk/tambah',async(req,res,next)=>{
    try{

        const paramrisk = req.body
        paramrisk.identry = req.user.data.nik

        const paramproj = {}
        paramproj.table = 'risk'
        paramproj.field = 'risk'
        paramproj.idproj = req.body.idproj

       

        const resq = await risk.add(paramrisk)
        const resp = await proj.addNumber(paramproj)
        resq.norisk = resp
        res.status(200).json(resq)

    }catch(e){
        console.error(e)
        next(e)
    }
})

module.exports = router