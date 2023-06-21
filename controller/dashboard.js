const express = require('express');
const router = express.Router({mergeParams:true});
const dashboard = require('../services/dashboard')
const axios = require('axios').default;


router.get('/project', async (req, res, next) => {
    try {

        const rows = await dashboard.listProyek();
        const rest = await rows.map(async(v)=>{
                const st = await dashboard.stepper({
                    id: ''+v.id
                })
                let o = {};
                if (st.length !== 0) {

                    let obj = st[0];
                    Object.keys(obj).forEach((x) => o[x] = !!obj[x]);

                }

                return { ...v, progress_by_step: o}
        })

      
       Promise.all(rest).then(async (r) => {
            res.status(200).json({
                "status": 200,
                "message": "Succcessfully get project list",
                "data":r})
            })
       
    } catch (err) {
        console.error(err);
        next(err);
    }
});

async function getinfonik() {
    let options
    let data
   
    options = process.env.NIK_INFO + '?org=%IT%'
  
   await axios.get(options).then((res)=>
    {
       //console.dir(res.data)
       data = res.data
       return data
      })

      
    return data

}

router.get('/project/summary', async (req, res, next) => {
    try {
        console.dir("masuk")
        const rest = await dashboard.summary()
        res.status(200).json({
            "status": 200,
            "message": "Succcessfully get project summary",
            "data":rest
        })
    }catch(err){
        console.error(err)
        next(err)
    }
})

router.get('/project/:id', async (req, res, next) => {
    try {
        
       
        const rows = await dashboard.projectById({ id: req.params.id });
        const rest = await rows.map(async(v)=>{
            const st = await dashboard.stepper({
                id: ''+v.id
            })
            const rl = await dashboard.realisasi({
                id: ''+v.id
            })
            const datanik = await getinfonik()

            rl.for
            let rlnama = []
            await rl.forEach(d=>rlnama.push({...d,pelaksana:d.pelaksana+" - "+datanik.data.find(x=>x.nik===d.pelaksana).nama}))
            let out = []
            await rlnama.forEach(function(item) {
                var existing = out.filter(function(v, i) {
                  return v.kegiatan == item.kegiatan;
                });
                if (existing.length) {
                  var existingIndex = out.indexOf(existing[0]);
                  out[existingIndex].pelaksana = out[existingIndex].pelaksana.concat(item.pelaksana);
                } else {
                  if (typeof item.pelaksana == 'string')
                    item.pelaksana = [item.pelaksana];
                  out.push(item);
                }
              });

            let o = {};
            if (st.length !== 0) {

                let obj = st[0];
                Object.keys(obj).forEach((x) => o[x] = !!obj[x]);

            }

            return { ...v, realisasi:out, progress_by_step: o}
    })

    
    Promise.all(rest).then(async (r) => {
        res.status(200).json({
            "status": 200,
            "message": "Succcessfully get project by ID : "+req.params.id,
            "data":r})
        })
        .catch(er=>console.error(er))

    } catch (err) {
        console.error(err);
        next(err);
    }
});




module.exports = router;