const express = require('express');
const router = express.Router();
const plan = require('../services/plan');
const proj = require('../services/proyek')
const map = require('../util/errorHandling')
const oracle = require("oracledb");


router.get('/plan', async (req, res, next) => {
    try {

        const rows = await plan.find({
            idplanreal: req.query.id
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

router.get('/plan/:id', async (req, res, next) => {
    try {

        const idproj = req.params.id.toString()
        let data = {}
        const rows = await plan.find2({
            idproj: idproj
        });
      
        const resnr = await proj.stepper({id:idproj})
        
        if (rows.length != 0 || resnr.length != 0 ) {
            rows.map((el)=>el.REALISASI = !!el.REALISASI)
            if(resnr[0].NOPLAN){
            data.NOPLAN=resnr[0].NOPLAN
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

router.post('/plan/tambah',async(req,res,next)=>{
    const conn = await oracle.getConnection()
    try{
       const idproj = req.body.idproj.toString()
        const parampr = req.body
        const formap = {}
        formap.idproj = req.body.idproj
        formap.identry = req.user.data.nik
        const paramnoplan = {}
        paramnoplan.table = 'planreal'
        paramnoplan.field = 'plan'
        paramnoplan.idproj = req.body.idproj

        const paramnoresc = {}
        paramnoresc.table = 'othrresrc'
        paramnoresc.field = 'resrc'
        paramnoresc.idproj = req.body.idproj
        //const raw = parampr
        //const mapdata = parampr.listdetail.flatMap(({ idkegiatan, pelaksana,tglmulai,tglselesai }) => pelaksana.map(nik => (Object.assign({ idkegiatan,nik,tglmulai,tglselesai},formap))))
        const mapdata = parampr.listdetail.flatMap(({ idkegiatan, pelaksana,tglmulai,tglselesai }) => pelaksana.map(nik => ({ idkegiatan,nik,tglmulai,tglselesai})))
        
       // const rest = await plan.addPlan(mapdata)
        
        //console.dir(mapdata)
        let reselect ={}
        const batch =  mapdata.map(async (el, i, array) => {
            el.idproj = req.body.idproj
            el.identry = req.user.data.nik
            if (i == array.length - 1) {
                
                const res = await plan.addPlan(el, {
                } ,conn)
                const nr = await proj.addNumber(paramnoplan,{},conn)
                const nr2 = await proj.addNumber(paramnoresc,{autoCommit:true},conn)
               
            } else {
                const res = await plan.addPlan(el, {},conn)
               
            }

        })
        //res.status(200).json(rest)
        //
         return Promise.all(batch).then(async() => {
            const find = await plan.find2({idproj:idproj})
            find.map((el)=>el.REALISASI = !!el.REALISASI)
            const resnr = await proj.stepper({id:idproj})
            reselect.NOPLAN=resnr[0].NOPLAN
            reselect.LISTDETAIL = find
           

            res.status(200).json(reselect)
            conn.close()
            console.dir(oracle.getPool().connectionsInUse)
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

router.put('/plan/ubah',async(req,res,next)=>{
    const conn = await oracle.getConnection()
    try{
       const idproj = req.body.idproj.toString()
        const parampr = req.body
        const formap = {}
        formap.idproj = req.body.idproj
        formap.identry = req.user.data.nik
        const paramproj = {}
        paramproj.table = 'planreal'
        paramproj.field = 'plan'
        paramproj.idproj = req.body.idproj

        const paramnoresc = {}
        paramnoresc.table = 'othrresrc'
        paramnoresc.field = 'resrc'
        paramnoresc.idproj = req.body.idproj
        //const raw = parampr
        //const mapdata = parampr.listdetail.flatMap(({ idkegiatan, pelaksana,tglmulai,tglselesai }) => pelaksana.map(nik => (Object.assign({ idkegiatan,nik,tglmulai,tglselesai},formap))))
        const mapdata = parampr.listdetail.flatMap(({ idkegiatan, pelaksana,tglmulai,tglselesai }) => pelaksana.map(nik => ({ idkegiatan,nik,tglmulai,tglselesai})))
        
       // const rest = await plan.addPlan(mapdata)
        const del = await plan.delplan({idproj:idproj},{},conn)
        //console.dir(mapdata)
        let reselect ={}
        const batch =  mapdata.map(async (el, i, array) => {
            el.idproj = idproj
            el.identry = req.user.data.nik
            if (i == array.length - 1) {
                
                const res = await plan.addPlan(el, {
                } ,conn)
                const nr = await proj.addNumber(paramproj,{},conn)
                const nr2 = await proj.addNumber(paramnoresc,{autoCommit:true},conn)
               
               
            } else {
                const res = await plan.addPlan(el, {},conn)
               
            }

        })
        //res.status(200).json(rest)
        //
         return Promise.all(batch).then(async() => {
            const find = await plan.find2({idproj:idproj})
            find.map((el)=>el.REALISASI = !!el.REALISASI)
            const resnr = await proj.stepper({id:idproj})
            reselect.NOPLAN=resnr[0].NOPLAN
            reselect.listdetail = find
           

            res.status(200).json(reselect)
            conn.close()
            console.dir(oracle.getPool().connectionsInUse)
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