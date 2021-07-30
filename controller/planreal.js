const express = require('express');
const router = express.Router();
const pr = require('../services/planreal');
const proj = require('../services/proyek')
const map = require('../util/errorHandling')


router.get('/planreal', async (req, res, next) => {
    try {

        const rows = await pr.find({
            idplanreal: req.query.id
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

router.get('/planreal/:id', async (req, res, next) => {
    try {

        const rows = await pr.find({
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

router.post('/planreal/tambah',async(req,res,next)=>{
    try{

        const parampr = req.body
        parampr.identry = req.user.data.nik

        const paramproj = {}
        paramproj.table = 'planreal'
        paramproj.field = 'plan'
        paramproj.idproj = req.body.idproj

       

        const resq = await pr.add(parampr)
        const resp = await proj.addNumber(paramproj)
        resq.norisk = resp
        res.status(200).json(resq)

    }catch(err){
        const { errorNum } = err;
        const message = await map.map(errorNum)
        res.status(500).json({"code":errorNum,"message":message});
        next(err)
    }
})

module.exports = router