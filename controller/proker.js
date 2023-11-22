const express = require('express');
const router = express.Router();
const proker = require('../services/proker');
const map = require('../util/errorHandling')


router.get('/proker',async(req,res,next)=>{

    try{
        const row = await proker.find()
        if (row.length !== 0) {
            res.status(200).json(row);
        } else {
            res.status(200).json({});
        }
    } catch (err) {
        console.error(err)
        next(err)
    }
})

router.get('/proker/:id', async (req, res, next) => {
    try {

        const rows = await proker.find({
            idproker: req.params.id
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

router.post('/proker/tambah',async(req,res,next)=>{
    try{

        const params = req.body
        params.IDENTRY = req.user.data.nik

        const rest = await proker.add(params)
        const r = await proker.find()
        res.status(200).json(r)

    }catch(err){
        const { errorNum } = err;
        const message = await map.map(errorNum)
        res.status(500).json({"code":errorNum,"message":message});
        next(err)
    }
})

router.put('/proker/edit',async(req,res,next)=>{
    try{

        const params = req.body
        params.IDUPDATE = req.user.data.nik

        const rest = await proker.edit(params)
        const r = await proker.find()
        res.status(200).json(r)

    }catch(err){
        const { errorNum } = err;
        const message = await map.map(errorNum)
        res.status(500).json({"code":errorNum,"message":message});
        next(err)
    }
})

router.delete('/proker/hapus',async (req,res,next)=>{
    try{
        const rest = await proker.remove({idproker:req.body.id})

        if(rest==1){
            const r = await proker.find()
            res.status(200).json(r)
        }else{
            res.status(500).json({"code":500,"message":"TIdak Berhasil Hapus"})
        }
    }catch(e){
        console.error(e)
    }
})

module.exports = router