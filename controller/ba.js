const express = require('express');
const router = express.Router();
const ba = require('../services/ba');
const proj = require('../services/proyek')
const map = require('../util/errorHandling')
const smail = require('../services/email')
const pgun = require('../services/pengguna')
const oracle = require("oracledb");

router.post('/ba/tambah',async(req,res,next)=>{
    try{
        const idproj = req.body.idproj.toString()
        
        const rest = await ba.addBa({idproj:idproj})
        const datapro = await proj.find({id:idproj});
        let mail = await pgun.useremail({nik:datapro[0].NIKREQ})
       
        if(!mail[0].EMAIL){
            mail = await smail.getmail({nik:datapro[0].NIKREQ})
        }
        const mailbpo = {}
        mailbpo.email = mail[0].EMAIL.split('@')[0]
        mailbpo.proyek = datapro[0].NAMAPROYEK
        mailbpo.role = "BPO"
        const cc = []
        const to = [mailbpo]
 
        const parammail = {}
        parammail.cc = cc
        parammail.code = "addba"
        parammail.to = to
        
        const resmail = await smail.mail(parammail)
        if(rest==1){
            res.status(200).json({"code":200,"message":"berhasil Simpan"})
        }else{
            res.status(500).json({"code":500,"message":"TIdak berhasil Simpan"})
        }
    }catch(err){
        const { errorNum } = err;
        const message = await map.map(errorNum)
        res.status(500).json({"code":errorNum,"message":message});
        conn.close()
        next(err)
    }
})

router.post('/ba/approve',async(req,res,next)=>{
    try{
        const idproj = req.body.idproj.toString()
        const rest = await ba.approveBa(idproj)
        if(rest==1){
            res.status(200).json({"code":200,"message":"berhasil Approve"})
        }else{
            res.status(500).json({"code":500,"message":"TIdak berhasil Approve"})
        }

    }catch(err){
        const { errorNum } = err;
        const message = await map.map(errorNum)
        res.status(500).json({"code":errorNum,"message":message});
        conn.close()
        next(err)
    }
})

module.exports = router