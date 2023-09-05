const express = require('express');
const router = express.Router();
const real = require('../services/real');
const proj = require('../services/proyek')
const map = require('../util/errorHandling')
const oracle = require("oracledb");


router.get('/real', async (req, res, next) => {
    try {

        const rows = await real.find({
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

router.get('/real/:id', async (req, res, next) => {
    try {

        const idproj = req.params.id.toString()
        let data = {}
        const rows = await real.find({
            idproj: idproj
        });
      
        const resnr = await proj.stepper({id:idproj})
        
        if (rows.length != 0 || resnr.length != 0 ) {
            if(resnr[0].NOREAL){
            data.NOREAL=resnr[0].NOREAL
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

router.post('/real/tambah',async(req,res,next)=>{
    const conn = await oracle.getConnection()
    try{
       const idproj = req.body.idproj.toString()
        const parampr = req.body
        const formap = {}
        formap.idproj = req.body.idproj
        formap.identry = req.user.data.nik
        const paramnoreal = {}
        paramnoreal.table = 'real'
        paramnoreal.field = 'real'
        paramnoreal.idproj = req.body.idproj

        const paramnoresc = {}
        paramnoresc.table = 'othrresrc'
        paramnoresc.field = 'resrc'
        paramnoresc.idproj = req.body.idproj
        //const raw = parampr
        //const mapdata = parampr.listdetail.flatMap(({ idkegiatan, pelaksana,tglmulai,tglselesai }) => pelaksana.map(nik => (Object.assign({ idkegiatan,nik,tglmulai,tglselesai},formap))))
        const mapdata = parampr.listdetail.flatMap(({ idkegiatan, pelaksana,tglmulai,tglselesai,progress }) => pelaksana.map(nik => ({ idkegiatan,nik,tglmulai,tglselesai,progress})))
        
       // const rest = await real.addPlan(mapdata)
        
        //console.dir(mapdata)
        let reselect ={}
        const batch =  mapdata.map(async (el, i, array) => {
            el.idproj = req.body.idproj
            el.identry = req.user.data.nik
            if (i == array.length - 1) {
                
                const res = await real.addReal(el, {
                } ,conn)
                const nr = await proj.addNumber(paramnoreal,{autoCommit:true},conn)
          
               
            } else {
                const res = await real.addReal(el, {},conn)
               
            }

        })
        //res.status(200).json(rest)
        //
         return Promise.all(batch).then(async() => {
            const find = await real.find({idproj:idproj})
            const resnr = await proj.stepper({id:idproj})
            reselect.NOREAL=resnr[0].NOREAL
            reselect.LISTDETAIL = find
           

            res.status(200).json(reselect)
            conn.close()
            console.dir(oracle.getPool().connectionsInUse)
        }).catch((e)=>{
            console.dir(e)
           conn.close()
        })
        

    }catch(err){
        const { errorNum } = err;
        const message = await map.map(errorNum)
        res.status(500).json({"code":errorNum,"message":message});
        conn.close()
        next(err)
    }
  
       
    
   
})

router.put('/real/ubah',async(req,res,next)=>{
    const conn = await oracle.getConnection()
    try{
       const idproj = req.body.idproj.toString()
        const parampr = req.body
        const formap = {}
        formap.idproj = req.body.idproj
        formap.identry = req.user.data.nik
        const paramproj = {}
        paramproj.table = 'real'
        paramproj.field = 'real'
        paramproj.idproj = req.body.idproj

        
        //const raw = parampr
        //const mapdata = parampr.listdetail.flatMap(({ idkegiatan, pelaksana,tglmulai,tglselesai }) => pelaksana.map(nik => (Object.assign({ idkegiatan,nik,tglmulai,tglselesai},formap))))
        const mapdata = parampr.listdetail.flatMap(({ idkegiatan, pelaksana,tglmulai,tglselesai,progress }) => pelaksana.map(nik => ({ idkegiatan,nik,tglmulai,tglselesai,progress})))
         
       // const rest = await real.addPlan(mapdata)
        const del = await real.delreal({idproj:idproj},{},conn)
        //console.dir(mapdata)
        let reselect ={}
        const batch =  mapdata.map(async (el, i, array) => {
            el.idproj = idproj
            el.identry = req.user.data.nik
            if (i == array.length - 1) {
                
                const res = await real.addReal(el, {
                } ,conn)
                const nr = await proj.addNumber(paramproj,{autoCommit:true},conn)
                
               
               
            } else {
                const res = await real.addReal(el, {},conn)
               
            }

        })
        //res.status(200).json(rest)
        //
         return Promise.all(batch).then(async() => {
            const find = await real.find({idproj:idproj})
            const resnr = await proj.stepper({id:idproj})
            reselect.NOREAL=resnr[0].NOREAL
            reselect.LISTDETAIL = find
           

            res.status(200).json(reselect)
            conn.close()
            console.dir(oracle.getPool().connectionsInUse)
        }).catch((e)=>{
            console.dir(e)
            conn.close()
           
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
