const express = require('express');
const router = express.Router();
const porto = require('../services/porto');
const map = require('../util/errorHandling')
const oracle = require("oracledb");
const upload = require('../util/upload')


router.get('/porto',async(req,res,next)=>{

    try{
        const row = await porto.findParent()
        if (row.length !== 0) {
            res.status(200).json(row);
        } else {
            res.status(200).json([]);
        }
    } catch (err) {
        console.error(err)
        next(err)
    }
})



router.post('/porto/tambah',async(req,res,next)=>{
    const conn = await oracle.getConnection();
    try{

        const params = req.body
        params.identry = req.user.data.nik

        const respar = await porto.addParent(params,{},conn);

       

        let reselect;

        const dtl = params.listdetail.map(async (el, i, array) => {
            el.idporto = respar.id;
            el.identry = req.user.data.nik;
            if (i == array.length - 1) {
                const res = await porto.addChild(el,{autoCommit: true},conn);
               
                //resdetail.push(res)

            } else {
                const res = await porto.addChild(el,{},conn);
                //resdetail.push(res)
            }

        });

        return Promise.all(dtl).then(async () => {
            reselect = await porto.findParent({ idporto: respar.id });
            console.dir(reselect);
            if (reselect.length !== 0) {
               
                const rowsch = await porto.findChild({ idporto: respar.id });

                reselect[0].LISTDETAIL = rowsch || null;
               

            }

         
            //console.dir(mail);
             else {

                const delt = await porto.removeParent({ idporto: respar.id },{},conn);
                const deltch = await porto.removeChild({ idporto: respar.id },{autoCommit: true},conn);
                res.status(500).json({ "code": "500", "message": "Gagal Simpan" });
            }
            res.status(200).json(reselect)
            await  conn.close()
        });

    }catch(err){
        const { errorNum } = err;
        const message = await map.map(errorNum)
        res.status(500).json({"code":errorNum,"message":message});
        await conn.close();
        next(err)
    }
})

router.put('/porto/edit',async(req,res,next)=>{
   const conn = await oracle.getConnection();
    try {
        const idporto = req.body.idporto;
        const params = req.body;
        params.idubah = req.user.data.nik;
        const respar = await porto.editParent(params);
        const del = await porto.removeChild(params, {}, conn);
        let reselect;

        const dtl = params.listdetail.map(async (el, i, array) => {
            el.idporto = idporto;
            el.identry = req.user.data.nik;
            if (i == array.length - 1) {
                const res = await porto.addChild(el, {
                    autoCommit: true
                }, conn);
                //resdetail.push(res)
            } else {
                const res = await porto.addChild(el, [], conn);
                // resdetail.push(res)
            }

        });

        return Promise.all(dtl).then(async () => {
            reselect = await porto.findParent({ idporto: idporto });
            if (reselect.length !== 0) {

                const rowsch = await porto.findChild({ idporto: idporto });

                reselect[0].LISTDETAIL = rowsch || null;

            }

            res.status(200).json(reselect[0]);
            await conn.close();
        });
    } catch (err) {
        const { errorNum } = err;
        const message = await map.map(errorNum);
        res.status(500).json({ "code": errorNum, "message": message });
       await conn.close();
        next(err);
    }

})

router.delete('/porto/hapus',async (req,res,next)=>{
    try{
        console.log(req.body.id);
        const restc = await porto.removeChild({idporto:req.body.id})
        const restp = await porto.removeParent({idporto:req.body.id})
        console.log(restc);
        console.log(restp);
        if(restc==1 || restp===1){
            
        
        res.status(200).json({"code":200,"message":"Berhasil Hapus"})
        }else{
            res.status(500).json({"code":500,"message":"TIdak Berhasil Hapus"})
        }
    }catch(e){
        console.error(e)
    }
})

router.get('/porto/grup',async(req,res,next)=>{
    try{
        const rest =await porto.grupporto()

        res.status(200).json(rest)
    }catch(err){
        console.error(err)
        next(err)
    }
})

router.get('/porto/kode',async(req,res,next)=>{
    try{
       
        const rest =await porto.kodeporto()
        res.status(200).json(rest)
    }catch(err){
        console.error(err)
        next(err)
    }
})

router.post('/porto/upload',upload.single('file'), async(req,res,next)=>{
    try{
       console.log(req.file);
        if(req.file){
           res.status(200).json({ "code": 200, "message": "Berhasil Upload" });
        }else{
            res.status(500).json({ "code": 500, "message": "Tidak Berhasil Upload" });
        }

    }catch(e){
        const { errorNum } = err;
        const message = await map.map(errorNum);
        res.status(500).json({ "code": errorNum, "message": message });
        next(err);
    }
})

router.get('/porto/download',async(req,res,next)=>{
    try{
        const name = req.query.filename
        const file = '/data2/ITPM/'+name
        console.log(file);
        res.type('blob')
       res.setHeader('Content-disposition', 'attachment; filename=' + name +', content-type=image/'+name.split('.').pop());
        res.download(file)
    }catch(e){
        console.log(e);
        const { errorNum } = err;
        const message = await map.map(errorNum);
        res.status(500).json({ "code": errorNum, "message": message });
        next(err);
    }
})

router.get('/porto/:id', async (req, res, next) => {
    try {

        const rows = await porto.findParent({
            idporto: req.params.id
        });
        if (rows.length !== 0) {

            const rowsch = await porto.findChild({ idporto: rows[0].IDPORTO });

            rows[0].LISTDETAIL = rowsch || null;

            res.status(200).json(rows[0]);
        } else {
            res.status(200).json({});
        }
    } catch (err) {
        console.error(err)
        next(err)
    }
})

module.exports = router
