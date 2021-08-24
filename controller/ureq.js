const express = require('express');
const router = express.Router();
const ureq = require('../services/ureq');
const proj = require('../services/proyek')
const map = require('../util/errorHandling')
const oracle = require("oracledb");

router.get('/ureq', async (req, res, next) => {
    try {

        const rows = await ureq.find({
            idureq: req.query.id
        });
        if (rows.length !== 0) {
            res.status(200).json(rows);
        } else {
            res.status(200).json({});
        }
    } catch (err) {
        const { errorNum } = err;
        const message = await map.map(errorNum)
        res.status(500).json({"code":errorNum,"message":message});
        next(err)
    }
})

router.get('/ureq/:id', async (req, res, next) => {
    try {
        let data = {}
        const idproj = req.params.id.toString()

        const rows = await ureq.find({
            idproj: idproj
        });
        
         const resnr = await proj.stepper({id:idproj})
         
         if(rows.length != 0 || resnr.length != 0) {

            if(resnr[0].NOUREQ){
            data.NOUREQ= resnr[0].NOUREQ
         
            data.listdetail = rows
            
            res.status(200).json(data);
            }else{
                res.status(200).json({}); 
            }
        } else {
            res.status(200).json({});
        }
    } catch (err) {
        const { errorNum } = err;
        const message = await map.map(errorNum)
        res.status(500).json({"code":errorNum,"message":message});
        next(err)
    }
})

router.post('/ureq/tambah',async(req,res,next)=>{
    const conn = await oracle.getConnection()
    try{
        const idproj = req.body.idproj.toString()
        const paramureq = req.body.listdetail
        //paramureq.identry = req.user.data.nik

        const paramproj = {}
        paramproj.table = 'ureq'
        paramproj.field = 'ureq'
        paramproj.idproj = req.body.idproj

        let reselect = {}
        const batch =  paramureq.map(async (el, i, array) => {
            el.identry = req.user.data.nik
            el.idproj = idproj
            if (i == array.length - 1) {
                
                const res = await ureq.add(el, {
                } ,conn)
                const nr = await proj.addNumber(paramproj,{autoCommit:true},conn)
               
            } else {
                const res = await ureq.add(el, {},conn)
                //rest.push(res)
            }

        })

        return Promise.all(batch).then(async() => {
            const find =  await ureq.find({idproj:req.body.idproj})
            const resnr = await proj.stepper({id:idproj})
            reselect.NOUREQ=resnr[0].NOUREQ

            reselect.listdetail = find
           
            res.status(200).json(reselect)
            await conn.close()
            
        }).catch((e)=>{
            console.dir(e)
            //conn.close()
        })

    }catch(err){
        const { errorNum } = err;
        const message = await map.map(errorNum)
        res.status(500).json({"code":errorNum,"message":message});
        conn.close()
        next(err)
    }
})

router.put('/ureq/ubah',async(req,res,next)=>{
    const conn = await oracle.getConnection()
   
    try{
        const idproj = req.body.idproj.toString()
        const paramureq = req.body
        const paramproj = {}
        paramproj.table = 'ureq'
        paramproj.field = 'ureq'
        paramproj.idproj = idproj
        const del = await ureq.del({idproj:idproj},{},conn)
        let reselect  = {}
        const batch =  paramureq.listdetail.map(async (el, i, array) => {
            el.identry = req.user.data.nik
            el.idproj = idproj
            if (i == array.length - 1) {
                
                const res = await ureq.add(el, {
                } ,conn)
                const nr = await proj.addNumber(paramproj,{autoCommit:true},conn)
               
            } else {
                const res = await ureq.add(el, {},conn)
                //rest.push(res)
            }

        })

        return Promise.all(batch).then(async() => {
            const find =  await ureq.find({idproj:req.body.idproj})
            const resnr = await proj.stepper({id:idproj})
            //console.dir(resnr[0].NOUREQ)
            reselect.NOUREQ=resnr[0].NOUREQ

            reselect.listdetail = find

            res.status(200).json(reselect)
            await conn.close()
            
        }).catch((e)=>{
            console.dir(e)
           // conn.close()
           
        })

    }catch(err){
        const { errorNum } = err;
        const message = await map.map(errorNum)
        res.status(500).json({"code":errorNum,"message":message});
         conn.close()
        next(err)
    }
})

module.exports = router