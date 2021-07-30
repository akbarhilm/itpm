const express = require('express');
const router = express.Router();
const charter = require('../services/charter');
const map = require('../util/errorHandling')

router.get('/charter', async (req, res, next) => {
    try {

        const rows = await charter.find({
            idcharter: req.query.id
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

router.get('/charter/:id', async (req, res, next) => {
    try {

        const rows = await charter.find({
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

router.post('/charter/tambah', async (req, res, next) => {
    try {

        const params = req.body
        params.identry = req.user.data.nik
        const respar = await charter.addParent(params);
        
        const resdetail = []

        const dtl = params.listdetail.map(async (el, i, array) => {
            el.idcharter = respar.idcharter
            if (i == array.length - 1) {
                const res = await charter.addChild(el, {
                    autoCommit: true
                }, true)
                resdetail.push(res)
            } else {
                const res = await charter.addChild(el, [], false)
                resdetail.push(res)
            }

        })

        return Promise.all(dtl).then(() => {
            respar.listdetail = resdetail
            res.status(200).json(respar)
        })

    } catch (err) {
        const { errorNum } = err;
        const message = await map.map(errorNum)
        res.status(500).json({"code":errorNum,"message":message});
        next(err)
    }
})

router.put('/charter/ubah', async(req,res,next)=>{

    try{

        const params = req.body
        params.idubah = req.user.data.nik
        const respar = await charter.editParent(params);
        const del = await charter.deleteChild(params.idcharter)
        const resdetail = []

        const dtl = params.listdetail.map(async (el, i, array) => {
            el.idcharter = respar.idcharter
            if (i == array.length - 1) {
                const res = await charter.addChild(el, {
                    autoCommit: true
                }, true)
                resdetail.push(res)
            } else {
                const res = await charter.addChild(el, [], false)
                resdetail.push(res)
            }

        })

        return Promise.all(dtl).then(() => {
            respar.listdetail = resdetail
            res.status(200).json(respar)
        })

    }catch(e){
        console.error(e)
        next(e)
    }

})

module.exports = router