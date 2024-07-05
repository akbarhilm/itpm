const express = require('express');
const router = express.Router();
const cata = require('../services/catalog');
const map = require('../util/errorHandling')
const oracle = require("oracledb");

router.get('/cata/combocat',async(req,res,next)=>{
    try{
        const rest = await cata.combocat()
        console.log(rest);
        res.status(200).json(rest)
    }catch(e){
        console.error(e)
        next(e)
    }
})

router.get('/cata',async(req,res,next)=>{
    try{
        const rest = await cata.find2()
        res.status(200).json(rest)
    }catch(e){
        console.error(e)
        next(e)
    }
})

router.get('/cata/kode',async(req,res,next)=>{
    try{
        const rest = await cata.kodecata()
        res.status(200).json(rest)
    }catch(e){
        console.error(e)
        next(e)
    }
})

router.post('/cata/tambah',async(req,res,next)=>{
    try{
        const param = req.body
        param.identry = req.user.data.nik

        const rest = await cata.addCata(param)
        if(rest.rowsAffected == 1 ){
        res.status(200).json(rest)
        }else{
            res.status(500).json({"message":"Gagal Simpan"})
        }

    }catch(err){
        const { errorNum } = err;
        const message = await map.map(errorNum)
        res.status(500).json({"code":errorNum,"message":message});
        next(err)
    }
})

router.put('/cata/edit',async(req,res,next)=>{
    try{
        const params = req.body
        const rest = await cata.editCata(params)
        if(rest.rowsAffected==1){
            res.status(200).json(rest)
        }else{
            res.status(500).json({"message":"Gagal Simpan"})
        }


    }catch(e){
        const { errorNum } = err;
        const message = await map.map(errorNum)
        res.status(500).json({"code":errorNum,"message":message});
        next(err)
    }
})

router.delete('/cata/hapus',async (req,res,next)=>{
    try{
        console.log(req.body.id);
        const rest = await cata.delCata({idkatalog:req.body.id})

        if(rest==1){
            const r = await cata.find2()
        
        res.status(200).json(r)
        }else{
            res.status(500).json({"code":500,"message":"TIdak Berhasil Hapus"})
        }
    }catch(e){
        console.error(e)
    }
})



module.exports = router