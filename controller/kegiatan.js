const express = require('express');
const router = express.Router();
const kegiatan = require('../services/kegiatan');
const map = require('../util/errorHandling')

router.get('/kegiatan', async (req, res, next) => {
    try {

        const rows = await kegiatan.find({
            namakegiatan: req.query.nama
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

router.get('/kegiatan/:id', async (req, res, next) => {
    try {

        const rows = await kegiatan.find({
            idkegiatan: req.params.id
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

router.post('/kegiatan/tambah',async(req,res,next)=>{
    try{

        const paramkegiatan = req.body
        paramkegiatan.identry = req.user.data.nik

        const resq = await kegiatan.add(paramkegiatan)

        res.status(200).json(resq)

    }catch(err){
        const { errorNum } = err;
        const message = await map.map(errorNum)
        res.status(500).json({"code":errorNum,"message":message});
        next(err)
    }
})

router.delete('/kegiatan/hapus',async (req,res,next)=>{
    try{
        const rest = await kegiatan.del({id:req.body.id})

        if(rest==1){
            res.status(200).json({code:200,message:"Berhasil Hapus"})
        }else{
            res.status(200).json({})
        }
    }catch(e){
        console.error(e)
    }
})