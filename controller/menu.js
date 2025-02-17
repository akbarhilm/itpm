const express = require('express');
const router = express.Router();
const menu = require('../services/menu');
const map = require('../util/errorHandling')



router.get('/menu/:id', async (req, res, next) => {
    try {
       
        const rows = await menu.find({ id: req.params.id });
        if (rows.length !== 0) {
            res.status(200).json(rows[0]);
        } else {
            res.status(200).send({});
        }
    } catch (err) {
        console.error(err)
        next(err)
    }
})

router.get('/menu/proyek/nik/:id', async (req, res, next) => {
    try {
       
        const rows = await menu.findMenuProyekByPengguna({ id: req.params.id,nik:req.user.data.nik  });
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


router.get('/menu', async (req, res, next) => {
    try {
       
        const rows = await menu.find()
        if (rows.length !== 0) {
            res.status(200).json(rows);
        } else {
            res.status(200).send([]);
        }
    } catch (err) {
        console.error(err)
        next(err)
    }
})

router.post('/menu/tambah',async(req,res,next)=>{
    try{
       // console.dir(req.body)
        const rows = await menu.save(req.body)
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

router.put('/menu/ubah',async(req,res,next)=>{
    try{
       // console.dir(req.body)
        const rows = await menu.edit(req.body)
        if(rows==1){
            res.status(200).send('Berhasil merubah data');
            }
    }catch (err) {
        console.error(err)
        next(err)
    }
})

router.delete('/menu/hapus',async(req,res,next)=>{
    try{
       // console.dir(req.body)
        const rows = await menu.del(req.body)
        if(rows==1){
        res.status(200).send('Berhasil menghapus data');
        }
    }catch (err) {
        console.error(err)
        next(err)
    }
})

module.exports = router