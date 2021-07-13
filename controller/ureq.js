const express = require('express');
const router = express.Router();
const ureq = require('../services/ureq');
const proj = require('../services/proyek')

router.get('/ureq', async (req, res, next) => {
    try {

        const rows = await ureq.find({
            idureq: req.query.id
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

router.get('/ureq/:id', async (req, res, next) => {
    try {

        const rows = await ureq.find({
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

router.post('/ureq/tambah',async(req,res,next)=>{
    try{

        const paramureq = req.body
        paramureq.identry = req.user.data.nik

        const paramproj = {}
        paramproj.table = 'ureq'
        paramproj.field = 'ureq'
        paramproj.idproj = req.body.idproj

       

        const resq = await ureq.add(paramureq)
        const resp = await proj.addNumber(paramproj)
        resq.noureq = resp
        res.status(200).json(resq)

    }catch(e){
        console.error(e)
        next(e)
    }
})

module.exports = router