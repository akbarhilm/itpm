const express = require('express');
const router = express.Router();
const uat = require('../services/uat');
const proj = require('../services/proyek')
const map = require('../util/errorHandling')
const smail = require('../services/email')
const alamatemail = require('../services/pengguna')
const oracle = require("oracledb");

router.get('/uat', async (req, res, next) => {
    try {

        const rowspar = await uat.find({
            idproj: req.query.id
        });

        if (rowspar.length !== 0) {
            
        //const rowsch =  await uat.findChild({iduat:rowspar[0].IDUAT}) 

       // rowspar[0].LISTDETAIL = rowsch||null

       
            res.status(200).json(rowspar);
        } else {
            res.status(200).json([]);
        }
    } catch (err) {
        console.error(err)
        next(err)
    }
})

router.get('/uat/:id', async (req, res, next) => {
    try {

        const rowspar = await uat.find({
            iduat: req.params.id
        });

        if (rowspar.length !== 0) {

        const rowsch =   await uat.findChild({iduat:rowspar[0].IDUAT})

        rowspar[0].LISTDETAIL = rowsch||null

            res.status(200).json(rowspar[0]);
        } else {
            res.status(200).json({});
        }
    } catch (err) {
        console.error(err)
        next(err)
    }
})

router.post('/uat/tambah', async (req, res, next) => {
    const conn = await oracle.getConnection()
    try {
        const idproj = req.body.idproj.toString()
        //=======================
        const paramparent = {}
        paramparent.idproj = idproj
        paramparent.identry = req.user.data.nik
        //==============================

        const paramsan = req.body.listdetail.analis
        const paramqa = req.body.listdetail.qa
        const paramus = req.body.listdetail.user

        let temparray = []
        temparray.push(paramsan.map(x=>Object.assign({"kodeuat":1,"nikuat":x})),
                        
                        paramus.map(x=>Object.assign({"kodeuat":2,"nikuat":x})),
                        paramqa.map(x=>Object.assign({"kodeuat":3,"nikuat":x})),
                        
                        )
       //=========================================
        temparray = temparray.flatMap(x=>x)
        const respar = await uat.addParent(paramparent,{},conn);
        const datapro = await proj.find({id:idproj});
        //const mail = await smail.getmail({nik:datapro[0].NIKREQ})

        //=================parammail==================//
        const mailqa = {}
       mailqa.email = "ahilman"
       mailqa.proyek = datapro[0].NAMAPROYEK
       mailqa.role = "QA"
       const cc = []
       const to = [mailqa]

       const parammail = {}
       parammail.cc = cc
       parammail.code = "adduat"
       parammail.to = to
       //================================end======================//

        let reselect
        //const resdetail = []
        //console.dir(temparray)
        const dtl = temparray.map(async (el, i, array) => {
            el.iduat = respar.iduat
            if (i == array.length - 1) {
                console.dir(el.nikuat)
                const res = await uat.addChild(el, {autoCommit:true}, conn)
                
                //resdetail.push(res)
                
            } else {
                const res = await uat.addChild(el, [], conn)
                //resdetail.push(res)
            }

        })

        return Promise.all(dtl).then(async() => {
            reselect = await uat.find({idproj:idproj})
            if (reselect.length !== 0) {

                const rowsch =   await uat.findChild({iduat:reselect[0].IDUAT})
        
                reselect[0].LISTDETAIL = rowsch||null
        
            }
            //const resmail = await smail.mail(parammail)
            //console.dir(resmail)
            res.status(200).json(reselect[0])
           await conn.close()
        })

    } catch (err) {
        const { errorNum } = err;
        const message = await map.map(errorNum)
        res.status(500).json({"code":errorNum,"message":message});
        conn.close()
        next(err)
    }
})

router.put('/uat/ubah', async (req, res, next) => {
    const conn = await oracle.getConnection()
    try {
        const idproj = req.body.idproj.toString()
        const iduat = req.body.iduat.toString()
        //=======================
        const paramparent = {}
        paramparent.idproj = idproj
        paramparent.identry = req.user.data.nik
        //==============================

        const paramsan = req.body.listdetail.analis
        const paramqa = req.body.listdetail.qa
        const paramus = req.body.listdetail.user

        let temparray = []
        temparray.push(paramsan.map(x=>Object.assign({"kodeuat":1,"nikuat":x})),
                        
                        paramus.map(x=>Object.assign({"kodeuat":2,"nikuat":x})),
                        paramqa.map(x=>Object.assign({"kodeuat":3,"nikuat":x})),
                        
                        )
       //=========================================
        temparray = temparray.flatMap(x=>x)
        //const respar = await uat.addParent(paramparent,{},conn);
        const del = await uat.deleteChild({iduat:iduat},{},conn)
        const datapro = await proj.find({id:idproj});
        //const mail = await smail.getmail({nik:datapro[0].NIKREQ})

        //=================parammail==================//
    //     const mailbpo = {}
    //    mailbpo.email = "ahilman"
    //    mailbpo.proyek = datapro[0].NAMAPROYEK
    //    mailbpo.role = "QA"
    //    const cc = []
    //    const to = [mailbpo]

    //    const parammail = {}
    //    parammail.cc = cc
    //    parammail.code = "adduat"
    //    parammail.to = to
       //================================end======================//

        let reselect
        //const resdetail = []
        console.dir(temparray)
        const dtl = temparray.map(async (el, i, array) => {
            el.iduat = iduat
            if (i == array.length - 1) {
                const res = await uat.addChild(el, {autoCommit:true}, conn)
                
                //resdetail.push(res)
                
            } else {
                const res = await uat.addChild(el, [], conn)
                //resdetail.push(res)
            }

        })

        return Promise.all(dtl).then(async() => {
            reselect = await uat.find({idproj:idproj})
            if (reselect.length !== 0) {

                const rowsch =   await uat.findChild({iduat:reselect[0].IDUAT})
        
                reselect[0].LISTDETAIL = rowsch||null
        
            }
            //const resmail = await smail.mail(parammail)
            //console.dir(resmail)
            res.status(200).json(reselect[0])
           await conn.close()
        })

    } catch (err) {
        const { errorNum } = err;
        const message = await map.map(errorNum)
        res.status(500).json({"code":errorNum,"message":message});
        conn.close()
        next(err)
    }
})

router.put('/uat/approveuser',async(req,res,next)=>{
    try{
        const param = req.body
        param.idubah = req.user.data.nik

        const result = await uat.approveuser(param)
        if(result == 1){
            res.status(200).json({"code":200,"message":"Berhasil Approve"})
        }else{
            res.status(500).json({"code":500,"message":"Tidak Berhasil Approve"})
        }
    }catch (err) {
        const { errorNum } = err;
        const message = await map.map(errorNum)
        res.status(500).json({"code":errorNum,"message":message});
        next(err)
    }
})

router.put('/uat/approveqa',async(req,res,next)=>{
    try{
        const param = req.body
        param.idubah = req.user.data.nik
        const datauat = await uat.find({iduat:req.body.iduat})
        const datapro = await proj.find({id:datauat[0].IDPROJ});
        const email = await alamatemail.useremail({nik:datapro[0].NIKREQ})
        const mailbpo = {}
       mailbpo.email = email[0].EMAIL
       mailbpo.proyek = datapro[0].NAMAPROYEK
       mailbpo.role = "BPO"
       const cc = []
       const to = [mailbpo]

       const parammail = {}
       parammail.cc = cc
       parammail.code = "approveqauat"
       parammail.to = to
     
        const result = await uat.approveqa(param)
        if(result == 1){
             const resmail = await smail.mail(parammail)
            console.dir(resmail)
            res.status(200).json({"code":200,"message":"Berhasil Approve"})
        }else{
            res.status(500).json({"code":500,"message":"Tidak Berhasil Approve"})
        }
    }catch (err) {
        const { errorNum } = err;
        const message = await map.map(errorNum)
        res.status(500).json({"code":errorNum,"message":message});
        next(err)
    }
})

module.exports = router