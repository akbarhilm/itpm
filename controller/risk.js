const express = require('express');
const router = express.Router();
const risk = require('../services/risk');
const proj = require('../services/proyek')
const oracle = require("oracledb");

router.get('/risk', async (req, res, next) => {
    try {

        const rows = await risk.find({
            idrisk: req.query.id
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

router.get('/risk/:id', async (req, res, next) => {
    try {

        let data = {}
        const idproj = req.params.id.toString()

        const rows = await risk.find({
            idproj: idproj
        });
        
         const resnr = await proj.stepper({id:idproj})
         
         if(rows.length != 0 || resnr.length != 0) {

            if(resnr[0].NORISK){
            data.NORISK= resnr[0].NORISK
         
            data.LISTDETAIL = rows
            
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

router.post('/risk/tambah',async(req,res,next)=>{
    const conn = await oracle.getConnection()
    try{
        const idproj = req.body.idproj.toString()
        const paramriskpr = req.body.listdetail.faktor
        const paramriskdt = req.body.listdetail.penanganan
        //paramureq.identry = req.user.data.nik

        const paramproj = {}
        paramproj.table = 'risk'
        paramproj.field = 'risk'
        paramproj.idproj = req.body.idproj
        let rest = []
        let reselect = {}
       
    const batch1 = paramriskpr.map(async (el, i, array) => {
        
            el.identry = req.user.data.nik
            el.idproj = idproj
          
                const res = await risk.add(el, {},conn)
               //rest.push(res)
               return res
          // console.dir(rest)

        })
        


        

         return Promise.all(batch1).then((rt) => {
             
            Promise.all(paramriskdt.map(async (el, i, array) => {
                el.identry = req.user.data.nik
                el.idproj = idproj
               rt.map(({idrisk,namafactor})=>namafactor==el.parent?el.parent = idrisk:null)
                if (i == array.length - 1) {
                    
                    const res = await risk.add(el, {
                    } ,conn)
                    const nr = await proj.addNumber(paramproj,{autoCommit:true},conn)
                   
                } else {
                    
                    const res = await risk.add(el, {},conn)
                   
                    //rest.push(res)
                }
    
            })
            ).then(async()=>{


            const find =  await risk.find({idproj:req.body.idproj})
            const resnr = await proj.stepper({id:idproj})
            reselect.NORISK=resnr[0].NORISK

            reselect.LISTDETAIL = find
           
            res.status(200).json(reselect)
             await conn.close()
            
        }).catch((e)=>{
            console.dir(e)
            conn.close()
        })

    }).catch((e)=>{
        console.dir(e)
    })

    }catch(err){
        const { errorNum } = err;
        const message = await map.map(errorNum)
        res.status(500).json({"code":errorNum,"message":message});
        conn.close()
        next(err)
    }
})

router.put('/risk/ubah',async(req,res,next)=>{
    const conn = await oracle.getConnection()
    try{
        const idproj = req.body.idproj.toString()
        const paramriskpr = req.body.listdetail.faktor
        const paramriskdt = req.body.listdetail.penanganan
        //paramureq.identry = req.user.data.nik

        const paramproj = {}
        paramproj.table = 'risk'
        paramproj.field = 'risk'
        paramproj.idproj = req.body.idproj
        const del = await risk.delrisk({idproj:idproj},{},conn)
        let reselect = {}

        const batch1 = paramriskpr.map(async (el, i, array) => {
        
            el.identry = req.user.data.nik
            el.idproj = idproj
          
                const res = await risk.add(el, {},conn)
               //rest.push(res)
               return res
          // console.dir(rest)

        })

       

        return Promise.all(batch1).then((rt) => {
             
            Promise.all(paramriskdt.map(async (el, i, array) => {
                el.identry = req.user.data.nik
                el.idproj = idproj
               rt.map(({idrisk,namafactor})=>namafactor==el.parent?el.parent = idrisk:null)
                if (i == array.length - 1) {
                    
                    const res = await risk.add(el, {
                    } ,conn)
                    const nr = await proj.addNumber(paramproj,{autoCommit:true},conn)
                   
                } else {
                    
                    const res = await risk.add(el, {},conn)
                   
                    //rest.push(res)
                }
    
            })
            ).then(async()=>{


            const find =  await risk.find({idproj:req.body.idproj})
            const resnr = await proj.stepper({id:idproj})
            reselect.NORISK=resnr[0].NORISK

            reselect.LISTDETAIL = find
           
            res.status(200).json(reselect)
             await conn.close()
            
        }).catch((e)=>{
            console.dir(e)
            conn.close()
        })

    }).catch((e)=>{
        console.dir(e)
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