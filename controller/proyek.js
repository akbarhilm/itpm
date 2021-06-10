const express = require('express');
const router = express.Router();
const proyek = require('../services/proyek');
const aplikasi = require('../services/aplikasi');
const modul = require('../services/modul') 
const layanan = require('../services/layanan');
router.get('/detail/:id', async (req, res, next) => {
    try {
        const resp = await proyek.find({id:req.params.id});
        
        const resla = await layanan.find({id:resp[0].IDLAYANAN})

        const resapp = await aplikasi.find({id:resp[0].IDAPLIKASI});
      
        const resmod = await modul.find({id:resp[0].IDMODUL});

        const obj = resp[0]
        
        delete obj.IDLAYANAN
        obj.LAYANAN = resla[0]||{}
        delete obj.IDAPLIKASI
        obj.APLIKASI = resapp[0]||{};
        delete obj.IDMODUL
        obj.MODUL = resmod[0]||{}
        if (obj.length !== 0) {

            res.status(200).json(obj);
        } else {
            res.status(404).json({});
        }
    } catch (err) {
        console.error(err)
        next(err)
    }
})

router.get('/', async (req, res, next) => {
    try {
       
        const rows = await proyek.find();
        if (rows.length !== 0) {
            res.status(200).json(rows[0]);
        } else {
            res.status(404).json({});
        }
    } catch (err) {
        console.error(err)
        next(err)
    }
})

router.get('/stepper/:id', async (req, res, next) => {
    try {
       
        const rows = await proyek.stepper({id:req.params.id});
        if (rows.length !== 0) {
            let o = {}
            let obj = rows[0]
            Object.keys(obj).forEach((x)=> o[x] = !!obj[x])
            res.status(200).json(o);
        } else {
            res.status(404).json({});
        }
    } catch (err) {
        console.error(err)
        next(err)
    }
})

router.post('/tambah', async (req, res, next) => {
    try {
        const params = req.body
        params.identry = req.user.data.nik
        const rows = await proyek.add(params);
        if (rows == 1) {
            res.status(200).json({"code":200,"message":"berhasil tambah"});
        } else {
            res.json({});
        }
    } catch (err) {
        console.error(err)
        next(err)
    }
})


module.exports = router