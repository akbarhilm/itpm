const express = require('express');
const router = express.Router();
const charter = require('../services/charter');
const map = require('../util/errorHandling')
const oracle = require("oracledb");

router.get('/charter', async (req, res, next) => {
    try {

        const rowspar = await charter.find({
            idcharter: req.query.id
        });

        if (rowspar.length !== 0) {
            
        const rowsch =  await charter.findChild({idcharter:rowspar[0].IDCHARTER}) 

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

router.get('/charter/:id', async (req, res, next) => {
    try {

        const rowspar = await charter.find({
            idproj: req.params.id
        });

        if (rowspar.length !== 0) {

        const rowsch =   await charter.findChild({idcharter:rowspar[0].IDCHARTER})

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

router.post('/charter/tambah', async (req, res, next) => {
    const conn = await oracle.getConnection()
    try {
        const idproj = req.body.idproj.toString()
        const params = req.body
        params.identry = req.user.data.nik
        const respar = await charter.addParent(params,{},conn);
        let reselect
        //const resdetail = []

        const dtl = params.listdetail.map(async (el, i, array) => {
            el.idcharter = respar.idcharter
            if (i == array.length - 1) {
                const res = await charter.addChild(el, {
                    autoCommit: true
                }, conn)
                //resdetail.push(res)
                
            } else {
                const res = await charter.addChild(el, [], conn)
                //resdetail.push(res)
            }

        })

        return Promise.all(dtl).then(async() => {
            reselect = await charter.find({idproj:idproj})
            if (reselect.length !== 0) {

                const rowsch =   await charter.findChild({idcharter:reselect[0].IDCHARTER})
        
                reselect[0].LISTDETAIL = rowsch||null
        
            }
            res.status(200).json(reselect)
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

router.put('/charter/ubah', async(req,res,next)=>{
    const conn = await oracle.getConnection()
    try{
        const idcharter = req.body.idcharter.toString()
        const params = req.body
        params.idubah = req.user.data.nik
        const respar = await charter.editParent(params,{},conn);
        const del = await charter.deleteChild(params,{},conn)
        let reselect

        const dtl = params.listdetail.map(async (el, i, array) => {
            el.idcharter = respar.idcharter
            if (i == array.length - 1) {
                const res = await charter.addChild(el, {
                    autoCommit: true
                }, conn)
                //resdetail.push(res)
            } else {
                const res = await charter.addChild(el, [], conn)
               // resdetail.push(res)
            }

        })

        return Promise.all(dtl).then(async() => {
            reselect = await charter.find({idcharter:idcharter})
            if (reselect.length !== 0) {

                const rowsch =   await charter.findChild({idcharter:reselect[0].IDCHARTER})
        
                reselect[0].LISTDETAIL = rowsch||null
        
            }
           
            res.status(200).json(reselect)
            await conn.close()
        })

    }catch (err) {
        const { errorNum } = err;
        const message = await map.map(errorNum)
        res.status(500).json({"code":errorNum,"message":message});
        conn.close()
        next(err)
    }

})

router.put('/charter/approve',async(req,res,next)=>{
    try{
        const param = req.body
        param.idubah = req.user.data.nik

        const result = await charter.approve(param)
        if(result == 1){
            res.status(200).json({"code":200,"message":"Berhasil Approve"})
        }else{
            res.status(200).json({"code":200,"message":"Tidak Berhasil Approve"})
        }
    }catch (err) {
        const { errorNum } = err;
        const message = await map.map(errorNum)
        res.status(500).json({"code":errorNum,"message":message});
        next(err)
    }
})

module.exports = router