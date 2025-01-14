const express = require('express');
const router = express.Router();
const charter = require('../services/charter');
const proj = require('../services/proyek');
const map = require('../util/errorHandling');
const smail = require('../services/email');
const oracle = require("oracledb");
const upload = require('../util/upload')


router.get('/charter', async (req, res, next) => {
    try {

        const rowspar = await charter.find({
            idcharter: req.query.id
        });

        if (rowspar.length !== 0) {

            const rowsch = await charter.findChild({ idcharter: rowspar[0].IDCHARTER });

            rowspar[0].LISTDETAIL = rowsch || null;


            res.status(200).json(rowspar[0]);
        } else {
            res.status(200).json({});
        }
    } catch (err) {
        console.error(err);
        next(err);
    }
});



router.post('/charter/tambah', async (req, res, next) => {
    const conn = await oracle.getConnection();
    try {
        const idproj = req.body.idproj.toString();
        const params = req.body;
        params.identry = req.user.data.nik;
        const respar = await charter.addParent(params, {}, conn);
        const datapro = await proj.find({ id: idproj });
        const mail = await smail.getmail({ nik: datapro[0].NIKREQ });

        //=================parammail==================//
        const mailbpo = {};
        mailbpo.email = mail[0].EMAIL.split('@')[0];
        mailbpo.proyek = datapro[0].NAMAPROYEK;
        mailbpo.role = "BPO";
        const cc = [];
        const to = [mailbpo];

        const parammail = {};
        parammail.cc = cc;
        parammail.code = "addcharter";
        parammail.to = to;
        //================================end======================//

        let reselect;
        //const resdetail = []

        const dtl = params.listdetail.map(async (el, i, array) => {
            el.idcharter = respar.idcharter;
            if (i == array.length - 1) {
                const res = await charter.addChild(el, [], conn);
                const updatestatus = await proj.updateStatus({ idproj: idproj, status:"BERJALAN" }, {
                    autoCommit: true
                }, conn);
                //resdetail.push(res)

            } else {
                const res = await charter.addChild(el, [], conn);
                //resdetail.push(res)
            }

        });

        return Promise.all(dtl).then(async () => {
            reselect = await charter.find({ idproj: idproj });
            if (reselect.length !== 0) {

                const rowsch = await charter.findChild({ idcharter: reselect[0].IDCHARTER });

                reselect[0].LISTDETAIL = rowsch || null;

            }
            const mail = await smail.mail(parammail);
            //console.dir(mail);
            if (mail && mail.status == 200) {
                res.status(200).json(reselect[0]);
            } else {

                const delt = await charter.failAddParent({ idcharter: reselect[0].IDCHARTER.toString() });
                const deltch = await charter.failAddChild({ idcharter: reselect[0].IDCHARTER.toString() });
                res.status(500).json({ "code": "500", "message": "Gagal Simpan" });
            }

            await conn.close();
        });

    } catch (err) {
        const { errorNum } = err;
        const message = await map.map(errorNum);
        res.status(500).json({ "code": errorNum, "message": message });
        conn.close();
        next(err);
    }
});

router.put('/charter/ubah', async (req, res, next) => {
    const conn = await oracle.getConnection();
    try {
        const idcharter = req.body.idcharter.toString();
        const params = req.body;
        params.idubah = req.user.data.nik;
        const respar = await charter.editParent(params, {}, conn);
        const del = await charter.deleteChild(params, {}, conn);
        let reselect;

        const dtl = params.listdetail.map(async (el, i, array) => {
            el.idcharter = respar.idcharter;
            if (i == array.length - 1) {
                const res = await charter.addChild(el, {
                    autoCommit: true
                }, conn);
                //resdetail.push(res)
            } else {
                const res = await charter.addChild(el, [], conn);
                // resdetail.push(res)
            }

        });

        return Promise.all(dtl).then(async () => {
            reselect = await charter.find({ idcharter: idcharter });
            if (reselect.length !== 0) {

                const rowsch = await charter.findChild({ idcharter: reselect[0].IDCHARTER });

                reselect[0].LISTDETAIL = rowsch || null;

            }

            res.status(200).json(reselect[0]);
            await conn.close();
        });

    } catch (err) {
        const { errorNum } = err;
        const message = await map.map(errorNum);
        res.status(500).json({ "code": errorNum, "message": message });
        conn.close();
        next(err);
    }

});

router.put('/charter/approve', async (req, res, next) => {
    try {
        const param = req.body;
        param.idubah = req.user.data.nik;

        const result = await charter.approve(param);
        if (result == 1) {
            res.status(200).json({ "code": 200, "message": "Berhasil Approve" });
        } else {
            res.status(500).json({ "code": 500, "message": "Tidak Berhasil Approve" });
        }
    } catch (err) {
        const { errorNum } = err;
        const message = await map.map(errorNum);
        res.status(500).json({ "code": errorNum, "message": message });
        next(err);
    }
});

router.post('/charter/upload',upload.single('file'), async(req,res,next)=>{
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

router.get('/charter/download',async(req,res,next)=>{
    try{
        const name = req.query.filename
        const file = '/data2/ITPM/'+name
        console.log(file);
        res.type('blob')
       res.setHeader('Content-disposition', 'attachment; filename=' + name);
        res.download(file)
    }catch(e){
        console.log(e);
        const { errorNum } = err;
        const message = await map.map(errorNum);
        res.status(500).json({ "code": errorNum, "message": message });
        next(err);
    }
})
router.get('/charter/reminder',async (req,res,next)=>{
    try{
        const param = req.query.tgl
       console.log(param);
        const rest = await charter.tglReminder({tgl:param})

        return res.status(200).json(rest[0])

    }catch(e){
        console.error(e)
        next(e)
    }
})

router.get('/charter/:id', async (req, res, next) => {
    try {

        const rowspar = await charter.find({
            idproj: req.params.id
        });

        if (rowspar.length !== 0) {

            const rowsch = await charter.findChild({ idcharter: rowspar[0].IDCHARTER });

            rowspar[0].LISTDETAIL = rowsch || null;

            res.status(200).json(rowspar[0]);
        } else {
            res.status(200).json({});
        }
    } catch (err) {
        console.error(err);
        next(err);
    }
});



module.exports = router;