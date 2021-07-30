const express = require('express');
const router = express.Router();
const proyek = require('../services/proyek');
const aplikasi = require('../services/aplikasi');
const modul = require('../services/modul') 
const layanan = require('../services/layanan');
const http = require('https');
const url = require('url')
router.get('/detail/:id', async (req, res, next) => {
  
    try {
       const rpro =  await proyek.find({id:req.params.id})
       const rla = await layanan.find({id:rpro[0].IDLAYANAN})
       const rapp = await aplikasi.find({id:rpro[0].IDAPLIKASI})
       const rmod = await modul.find({idmodul:rpro[0].IDMODUL})
       
       const robj = rpro[0]

       delete robj.IDLAYANAN
       robj.LAYANAN = rla[0]||null;

       delete robj.IDAPLIKASI
       robj.APLIKASI = rapp[0]||null

       delete robj.IDMODUL
       robj.MODUL = rmod[0]||null
    

        res.status(200).json(robj)
      
    } catch (err) {
        console.error(err)
        next(err)
    }

})

router.get('/', async (req, res, next) => {
    try {
       
        const rows = await proyek.find();
        if (rows.length !== 0) {
            res.status(200).json(rows);
        } else {
            res.status(200).json({});
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
            res.status(200).json({});
        }
    } catch (err) {
        console.error(err)
        next(err)
    }
})

 function getinfonik(params){
    return new Promise(async(resolve,reject)=>{
    
    let rawData = ''
        const options = new URL(`https://helpdesk-api.indonesian-aerospace.com/general/employee?nik=${params}`);
        await http.get(options, (res) => {
        const { statusCode } = res;
        const contentType = res.headers['content-type'];
      
        let error;
        // Any 2xx status code signals a successful response but
        // here we're only checking for 200.
        if (statusCode !== 200) {
          error = new Error('Request Failed.\n' +
                            `Status Code: ${statusCode}`);
        } else if (!/^application\/json/.test(contentType)) {
          error = new Error('Invalid content-type.\n' +
                            `Expected application/json but received ${contentType}`);
        }
        if (error) {
          console.error(error.message);
          // Consume response data to free up memory
          res.resume();
          return;
        }
      
        res.setEncoding('utf8');
       
        res.on('data', (chunk) => { rawData += chunk; });
        res.on('end', () => {
          try {
            const parsedData = JSON.parse(rawData);
           // console.log(parsedData);
            resolve(parsedData)
          } catch (e) {
              reject(e)
            console.error(e.message);
          }
        });
      }).on('error', (e) => {
        console.error(`Got error: ${e.message}`);
      });

      
    })
}



router.put('/ubah', async (req,res,next)=>{
    try{
        const param = req.body
        param.idupdate = req.user.data.nik
        const row =  await proyek.edit(param)
        res.status(200).json(row)
    }catch(err){
        console.error(err)
        next(err)
    }
})

router.post('/tambah', async (req, res, next) => {
    try {

        //=============param add proyek==============//
        const paramsproyek = req.body
        paramsproyek.identry = req.user.data.nik
        //=============end================//
        
        //============param add user==============//
        const paramuser = {}
        const pm = await getinfonik(req.body.nikpm)
        
        const bpo = await getinfonik(req.body.nikreq)
        paramuser.nikpm = req.body.nikpm
        paramuser.identry = req.user.data.nik
        paramuser.emailpm = pm.data.email
        paramuser.nikreq = req.body.nikreq
        paramuser.emailreq = bpo.data.email
        //==================end==============//

        //===========param user auth========//
        const paramuserauth ={}
        paramuserauth.nikpm = req.body.nikpm;
        paramuserauth.nikreq = req.body.nikreq
        //================end=============//
        
       
        const rows = await proyek.add(paramsproyek);
       
        const resuser = await proyek.addUser(paramuser);

        const resuserauth = await proyek.addUserAuth(paramuserauth)
       //console.dir(resuser)
        res.status(200).json(rows);
    } catch (err) {
        console.error(err)
        next(err)
    }
})


module.exports = router