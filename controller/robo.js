const express = require('express');
const router = express.Router();
const robo = require('../services/robo');
const proj = require('../services/proyek');
const map = require('../util/errorHandling');
const risk = require('../services/risk')
const oracle = require("oracledb");

// router.get('/robo', async (req, res, next) => {
//     try {

//         const rowspar = await robo.find({
//             idrobo: req.query.id
//         });

//         if (rowspar.length !== 0) {

//             const rowsch = await charter.findChild({ idcharter: rowspar[0].IDCHARTER });

//             rowspar[0].LISTDETAIL = rowsch || null;


//             res.status(200).json(rowspar[0]);
//         } else {
//             res.status(200).json({});
//         }
//     } catch (err) {
//         console.error(err);
//         next(err);
//     }
// });
router.get('/robo/ref/', async (req, res, next) => {
    try {
        const obj = {}
        const refrole = await robo.findRefRole()
        obj.refrole = refrole || null
        const refact = await robo.findRefRoAct()
        obj.refact = refact || null
        const refbo = await robo.findRefBoPlan()
        obj.refbo = refbo || null

        const rest = [obj]
        // if(rest.length>0){
        res.status(200).json(rest[0]);
        // }else{
        //     res.status(200).json({})
        // }
    } catch (err) {
        console.error(err);
        next(err);
    }
})
router.get('/robo/:id', async (req, res, next) => {
    try {

        const rowspar = await robo.findRoboMaster({
            idproj: req.params.id
        });
        //console.dir(rowspar[0].IDROBO )

        if (rowspar.length !== 0) {

            const roboresp = await robo.findRoboResp({ idrobo: rowspar[0].IDROBO });
            const roboact = await robo.findRoboAct({ idrobo: rowspar[0].IDROBO });
            const rrisk = await risk.find({ idproj: req.params.id })
            const boplan = await robo.findBoPlan({ idrobo: rowspar[0].IDROBO })
            const obj = {}
            obj.RESP = roboresp || null
            obj.ACT = roboact || null
            obj.RISK = rrisk || null
            obj.BO = boplan || null
            obj.new = false
            rowspar[0].LISTDETAIL = obj
            //rowspar[0].LISTDETAIL.ACT = roboact || null;

            res.status(200).json(rowspar[0]);
        } else {
            const newrobo = await robo.newRobo({ idproj: req.params.id })
            const obj = {}
            obj.RESP = []
            obj.ACT = []
            obj.RISK = []
            obj.BO = []
            obj.new = true
            newrobo[0].LISTDETAIL = obj

            res.status(200).json(newrobo[0]);
        }
    } catch (err) {
        console.error(err);
        next(err);
    }
});


router.post('/robo/tambah', async (req, res, next) => {
    const conn = await oracle.getConnection();
    try {
        const parammaster = {}
        parammaster.idproj = req.body.IDPROJ.toString()
        parammaster.jenislayanan = req.body.JENISLAYANAN
        parammaster.ketlayanan = req.body.KETLAYANAN
        parammaster.ketmodul = req.body.KETMODUL
        parammaster.identry = req.user.data.nik;

        const paramresp = [];
        const parambo = []
        let reselect;
        function mapdata(ob, tipe) {
            ob.forEach(d => {
                let columnNames = []
                if (tipe === 'RESP') {
                    columnNames = Object.keys(d).filter(key => key === "idroleresp" || key === "ketrole");
                }
                if (tipe === 'BO') {
                    columnNames = Object.keys(d).filter(key => key === "idboplan" || key === "ketplan");
                }
                const singleWithSplitted = columnNames.reduce((result, columnName) => {
                    const splittedArray = d[columnName].replace(/ *- */g, []).split(/[,\n]+/);
                    return ({
                        rowsCount: Math.max(result.rowsCount, splittedArray.length),
                        table: {
                            ...result.table,
                            [columnName]: splittedArray
                        }
                    });
                }, {
                    rowsCount: 0
                });

                for (i = 0; i < singleWithSplitted.rowsCount; i++) {
                    const result = { ...d };
                    columnNames.forEach((columnName) => {
                        result[columnName] = singleWithSplitted.table[columnName][i];
                    });
                    if (tipe === 'RESP') {
                        paramresp.push(result);
                    }
                    if (tipe === 'BO') {
                        parambo.push(result);
                    }
                };

            })
        }

        mapdata(req.body.LISTDETAIL.RESP, "RESP")
        mapdata(req.body.LISTDETAIL.BO, "BO")
        const paramact = req.body.LISTDETAIL.ACT

        // console.dir(parambo)
        // console.dir(paramresp)
        let act = null
        let nt = null
        let countr = 1
        let countb = 1
        let resmaster
        if(req.body.LISTDETAIL.EDIT){
            resmaster = await robo.updateRoboMaster(parammaster, { autoCommit: true }, conn)
            
            //console.dir(resmaster)
            await robo.deleteResp({idproj:parammaster.idproj})
            await robo.deleteAct({idproj:parammaster.idproj})
            await robo.deleteBO({idproj:parammaster.idproj})
            
        }else{
            resmaster = await robo.addRoboMaster(parammaster, { autoCommit: false }, conn)
        }
        //console.dir("param master")
        //console.dir(resmaster)
    const pr = await Promise.all(paramresp.map(async (el, i, array) => {
            el.idrobo = resmaster.idrobo;
            el.identry = req.user.data.nik;
            if(i>0){
                if(act === el.kodeactor){
                    countr++
                    el.nourut = countr.toString()
                    
                }else{
                    countr = 1
                    el.nourut = countr.toString()
                   
                }

                act = el.kodeactor
                
            }else{
                el.nourut = countr.toString()
                act = el.kodeactor

            }
           
               
           const res =   await robo.addRoboResp(el, { autoCommit: true }, conn);
            
          
        }).concat(paramact.map(async (el, i, array) => {
            el.idrobo = resmaster.idrobo;
            el.idroact =  el.idroact.toString()
            el.identry = req.user.data.nik;
            await robo.addRoboAct(el, { autoCommit: true }, conn);

        }),parambo.map(async (el, i, array) => {
            el.identry = req.user.data.nik;
            el.idrobo = resmaster.idrobo;

            if(i>0){
                if(nt === el.namatahap){
                    countb++
                    el.nourut = countb.toString()
                    
                }else{
                    countb = 1
                    el.nourut = countb.toString()
                   
                }

                nt = el.namatahap
                
            }else{
                el.nourut = countb.toString()
                nt = el.namatahap

            }

            
              const res =    await robo.addBOPlan(el, { autoCommit: true }, conn);
           
              
        })
        )).then(async (ress) => {
            //console.dir(ress)
            const rs = await robo.findRoboMaster({idproj:req.body.IDPROJ.toString()})
            return rs
        })

  
     
        
            const val = await pr
           
            res.status(200).json(val)
          await  conn.close()
       

    }
    catch (err) {
        const { errorNum } = err;
        const message = await map.map(errorNum)
        res.status(500).json({ "code": errorNum, "message": message });
        next(err)

       if(!req.body.LISTDETAIL.EDIT){
       await robo.deleteMaster({idproj:req.body.IDPROJ.toString()})
       await robo.deleteResp({idproj:req.body.IDPROJ.toString()})
       await robo.deleteAct({idproj:req.body.IDPROJ.toString()})
       await robo.deleteBO({idproj:req.body.IDPROJ.toString()})
       }else{
        await conn.rollback();
       }
        await conn.close()
    }

})


module.exports = router;