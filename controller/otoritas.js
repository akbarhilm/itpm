const express = require('express');
const router = express.Router();
const otoritas = require('../services/otoritas');
const map = require('../util/errorHandling')


router.get('/otoritas/:id', async (req, res, next) => {
    try {
        
        const rows = await otoritas.find({ id: req.params.id });
        if (rows.length !== 0) {
            res.status(200).json(rows[0]);
        } else {
            res.status(200).send('Data tidak ditemukan');
        }
    } catch (err) {
        console.error(err)
        next(err)
    }
})


router.get('/otoritas', async (req, res, next) => {
    try {
        
        const rows = await otoritas.find()
        if (rows.length !== 0) {
            res.status(200).json(rows);
        } else {
            res.status(200).send('Data tidak ditemukan');
        }
    } catch (err) {
        console.error(err)
        next(err)
    }
})

router.post('/otoritas/tambah',async(req,res,next)=>{
    try{
       // console.dir(req.body)
        const rows = await otoritas.save(req.body)
        if (rows == 1) {
            res.status(200).json({"code":200,"message":"berhasil tambah"});
        } else {
            res.status(500).json({"code":500,"message":"Tidak berhasil tambah"});
        }
    }catch (err) {
        const { errorNum } = err;
        const message = await map.map(errorNum)
        res.status(500).json({"code":errorNum,"message":message});
        next(err)
    }
})

router.put('/otoritas/ubah',async(req,res,next)=>{
    try{
       // console.dir(req.body)
        const rows = await otoritas.edit(req.body)
        if(rows==1){
            res.status(200).send('Berhasil merubah data');
            }
    }catch (err) {
        console.error(err)
        next(err)
    }
})

router.delete('/otoritas/hapus',async(req,res,next)=>{
    try{
       // console.dir(req.body)
        const rows = await otoritas.del(req.body)
        if(rows==1){
        res.status(200).send('Berhasil menghapus data');
        }
    }catch (err) {
        console.error(err)
        next(err)
    }
})

module.exports = router