const express = require('express');
const router = express.Router();
const pengguna = require('../services/pengguna');
const kar = require('./proyek')
const axios = require('axios').default;
const charter = require('../services/charter');
const real = require('../services/real');
const plan = require('../services/plan');
const proyek = require('../services/proyek');
const dashboard = require('../services/dashboard')


router.get('/pengguna/nik', async (req, res, next) => {
    try {

        const rows = await pengguna.find({ nik: req.user.data.nik, nama: req.user.data.nama });
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

router.get('/pengguna/proyek/summary', async (req, res, next) => {
    try {
        const param = {}
        param.nik = req.user.data.nik
        param.tahun = req.query.tahun.toString()
        const rows = await pengguna.summaryProyek(param);
        if (rows.length !== 0) {
            res.status(200).json(rows);
        } else {
            res.status(200).json({});
        }
    } catch (err) {
        console.error(err);
        next(err);
    }
})

async function getinfonik(param) {
    let options
    let data
    if (param) {
        options = process.env.NIK_INFO + param
    } else {
        options = process.env.NIK_INFO
    }
   await axios.get(options).then((res)=>
    {
       //console.dir(res.data)
       data = res.data
       return data
      })

      
    return data

}

router.get('/pengguna/proyek/nik', async (req, res, next) => {

    try {
        const datanik = await getinfonik()
        const param = {}
        const pc = {}
        param.nik = req.user.data.nik
        param.status = req.query.status.toString()
       const chgstatus = req.query.status.toString();
        if(req.query.non === 'true'){
            param.non = 'NON_SAP'
            
        }else{
           
            param.non = ''
        }
        if(req.query.sap === 'true'){
            
            param.sap = 'SAP'
        }else{
           
            param.sap = ''
        }
        if(req.query.sap === 'true' || req.query.non === 'true')
        param.d = true 
        else
        param.d =  false
        
        
        let rows
        if (req.query.nik) {
            rows = await proyek.proyekByNik({ nik: req.query.nik })
            //console.dir(rows)
        } else {
            rows = await pengguna.findPenggunaProyek(param);
            //console.dir("zxc")
        }


        if (req.query.d) {
            let restrows = []
            await rows.list.forEach(d=>{console.log(d) 
                const nbpo = datanik.data.filter(x=>x.nik===d.nik_BPO)
                
                const npm = datanik.data.filter(x=>x.nik===d.nik_PM)
                
                restrows.push({...d,
                nama_BPO:nbpo.length>0?nbpo[0].nama : d.nik_BPO,
                divisi_BPO:nbpo.length>0?nbpo[0].organisasi:' - ',
                nama_PM:npm.length>0?npm[0].nama : d.nik_PM,
                divisi_PM:npm.length>0?npm[0].organisasi : ' - ',
            
            }) }
            )
            
            const batch = await restrows.map(async (v) => {
                const cr = await charter.find({
                    idproj: v.IDPROYEK
                })

                const pl = await plan.find2({
                    idproj: v.IDPROYEK
                })

                const rl = await real.find({
                    idproj: v.IDPROYEK
                })
                const st = await proyek.stepper({
                    id: '' + v.IDPROYEK
                })
            
                    const plreport = await dashboard.reportrencana({
                        id: ''+v.IDPROYEK
                    })
        
                    const rlreport = await dashboard.reportrealisasi({
                        id: ''+v.IDPROYEK
                    })
                   
                    
                 
                   
                  
                    let mappl=[]
                    let maprl = []
                    let outpl = []
                    let outrl = []
                    if(plreport.length>0){
                       
                        await plreport.forEach((d)=>mappl.push({...d,pelaksana:d.pelaksana+" - "+datanik.data.filter(z=>z.nik === d.pelaksana).map(x=>x.nama).toString() }))
                         }
                         await mappl.forEach(function(item) {
                             var existing = outpl.filter(function(v, i) {
                               return v.kegiatan == item.kegiatan;
                             });
                             if (existing.length) {
                               var existingIndex = outpl.indexOf(existing[0]);
                               outpl[existingIndex].pelaksana = outpl[existingIndex].pelaksana.concat(item.pelaksana);
                             } else {
                               if (typeof item.pelaksana == 'string')
                                 item.pelaksana = [item.pelaksana];
                               outpl.push(item);
                             }
                           });
        
                           const hasilpl =  outpl.map(({kegiatan,pelaksana,target,...rest})=>({[kegiatan]:pelaksana.toString(),["target_"+kegiatan]:target, ...rest}))
                  
                    if(rlreport.length>0){
                       
                   await rlreport.forEach((d)=>maprl.push({...d,pelaksana:d.pelaksana+" - "+datanik.data.filter(z=>z.nik === d.pelaksana).map(x=>x.nama).toString() }))
                    }
                    await maprl.forEach(function(item) {
                        var existing = outrl.filter(function(v, i) {
                          return v.kegiatan == item.kegiatan;
                        });
                        if (existing.length) {
                          var existingIndex = outrl.indexOf(existing[0]);
                          outrl[existingIndex].pelaksana = outrl[existingIndex].pelaksana.concat(item.pelaksana);
                        } else {
                          if (typeof item.pelaksana == 'string')
                            item.pelaksana = [item.pelaksana];
                          outrl.push(item);
                        }
                      });
        
                    const hasilrl =  outrl.map(({kegiatan,pelaksana,...rest})=>({[kegiatan]:pelaksana.toString(),...rest}))
                  
                let o = {};
                if (st.length !== 0) {

                    let obj = st[0];
                    Object.keys(obj).forEach((x) => o[x] = !!obj[x]);

                }

                return { ...v, charter: cr, plan: pl,planreport:hasilpl, real: rl, realreport:hasilrl, stepper: o }
            })



            return Promise.all(batch).then(async (rest) => {
                const final = {}
                final.otoritas = rows.otoritas
                final.list = rest
                res.status(200).json(final)
            }).catch((e) => {
                console.dir(e)
            })
        } else {
            if (rows.length !== 0) {
                res.status(200).json(rows);
            } else {
                res.status(200).json({});
            }
        }
    } catch (err) {
        console.error(err)
        next(err)
    }

})



router.get('/pengguna/otoritas/nik', async (req, res, next) => {
    try {

        const rows = await pengguna.findPenggunaOtoritas({ nik: req.user.data.nik });
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

// function getinfonik(param){
//     return new Promise(async(resolve,reject)=>{

//     let rawData = ''
//     let options
//     if(param){
//          options = new URL(process.env.NIK_INFO+param)
//     }else{
//         options = new URL(process.env.NIK_INFO)
//     }
//         await http.get(options, (res) => {
//         const { statusCode } = res;
//         const contentType = res.headers['content-type'];

//         let error;
//         // Any 2xx status code signals a successful response but
//         // here we're only checking for 200.
//         if (statusCode !== 200) {
//           error = new Error('Request Failed.\n' +
//                             `Status Code: ${statusCode}`);
//         } else if (!/^application\/json/.test(contentType)) {
//           error = new Error('Invalid content-type.\n' +
//                             `Expected application/json but received ${contentType}`);
//         }
//         if (error) {
//           console.error(error.message);
//           // Consume response data to free up memory
//           res.resume();
//           return;
//         }

//         res.setEncoding('utf8');

//         res.on('data', (chunk) => { rawData += chunk; });
//         res.on('end', () => {
//           try {
//             const parsedData = JSON.parse(rawData);
//            // console.log(parsedData);
//             resolve(parsedData)
//           } catch (e) {
//               reject(e)
//             console.error(e.message);
//           }
//         });
//       }).on('error', (e) => {
//         console.error(`Got error: ${e.message}`);
//       });


//     })
// }



router.get('/karyawanIT', async (req, res, next) => {
    try {
        const kar = await getinfonik('?org=%IT%')

        res.status(200).json(kar.data)
    } catch (e) {
        console.err(e)
        res.status(500).json({ "code": "99", "message": "internal error" })
    }
})

router.get('/Allkaryawan', async (req, res, next) => {
    try {
        const kar = await getinfonik()
        
        res.status(200).json(kar.data)
    } catch (e) {
        console.error(e)
        res.status(500).json({ "code": "99", "message": "internal error" })
    }
})


module.exports = router