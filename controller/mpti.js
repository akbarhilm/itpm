const express = require('express');
const router = express.Router();
const mpti = require('../services/mpti');
const map = require('../util/errorHandling')


router.get('/mpti',async(req,res,next)=>{

    try{
        const row = await mpti.find()
        if (row.length !== 0) {
            res.status(200).json(row);
        } else {
            res.status(200).json([]);
        }
    } catch (err) {
        console.error(err)
        next(err)
    }
})

router.get('/mpti/:id', async (req, res, next) => {
    try {

        const rows = await mpti.find({
            idmpti: req.params.id
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

router.post('/mpti/tambah',async(req,res,next)=>{
    try{

        const params = req.body
        params.IDENTRY = req.user.data.nik

        const rest = await mpti.add(params)
        const r = await mpti.find()
        res.status(200).json(r)

    }catch(err){
        const { errorNum } = err;
        const message = await map.map(errorNum)
        res.status(500).json({"code":errorNum,"message":message});
        next(err)
    }
})

router.put('/mpti/edit',async(req,res,next)=>{
    try{

        const params = req.body
        params.IDUPDATE = req.user.data.nik

        const rest = await mpti.edit(params)
        const r = await mpti.find()
        res.status(200).json(r)

    }catch(err){
        const { errorNum } = err;
        const message = await map.map(errorNum)
        res.status(500).json({"code":errorNum,"message":message});
        next(err)
    }
})

router.delete('/mpti/hapus',async (req,res,next)=>{
    try{
        const rest = await mpti.remove({idmpti:req.body.id})

        if(rest==1){
            const r = await mpti.find()
            res.status(200).json(r)
        }else{
            res.status(500).json({"code":500,"message":"TIdak Berhasil Hapus"})
        }
    }catch(e){
        console.error(e)
    }
})

module.exports = router