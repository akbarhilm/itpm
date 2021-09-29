const express = require('express');
const router = express.Router();
const pengguna = require('../services/pengguna');
const kar = require('./proyek')
const http = require('https');

router.get('/pengguna/nik', async (req, res, next) => {
    try {
       
        const rows = await pengguna.find({ nik: req.user.data.nik,nama:req.user.data.nama });
        if (rows.length !== 0) {
           
            res.status(200).json(rows[0]);
        } else {
            res.status(200).json({});
        }
    } catch (err) {
        console.error(err)
        next(err)
    }
})

router.get('/pengguna/proyek/nik', async (req, res, next) => {
    try {
       
        const rows = await pengguna.findPenggunaProyek({ nik: req.user.data.nik  });
        if (rows.length !== 0) {
            res.status(200).json(rows);
        } else {
            res.status(200).json([]);
        }
    } catch (err) {
        console.error(err)
        next(err)
    }
})



router.get('/pengguna/otoritas/nik', async (req, res, next) => {
    try {
       
        const rows = await pengguna.findPenggunaOtoritas({ nik: req.user.data.nik  });
        if (rows.length !== 0) {
            res.status(200).json(rows);
        } else {
            res.status(200).json([]);
        }
    } catch (err) {
        console.error(err)
        next(err)
    }
})

router.get('/pengguna', async (req, res, next) => {
    try {
        const rows = await pengguna.find()
        if (rows.length !== 0) {
            res.status(200).json(rows);
        } else {
            res.status(200).json([]);
        }
    } catch (err) {
        console.error(err)
        next(err)
    }
})

function getinfonik(){
    return new Promise(async(resolve,reject)=>{
    
    let rawData = ''
        const options = new URL(process.env.NIK_INFO+`?org=%IT%`)
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

router.get('/karyawan',async(req,res,next)=>{
try{
   const kar = await getinfonik()
   
   res.status(200).json(kar.data)
}catch(e){
    console.err(e)
    res.status(500).json({"code":"99","message":"internal error"})
}
})


module.exports = router