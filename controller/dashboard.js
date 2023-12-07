const express = require('express');
const router = express.Router({mergeParams:true});
const dashboard = require('../services/dashboard')
const axios = require('axios').default;


router.get('/projects', async (req, res, next) => {
    try {
        const tahun = req.query.tahun
        const rows = await dashboard.listProyek({tahun:tahun});
        const rest = await rows.map(async(v)=>{
                const st = await dashboard.stepper({
                    id: ''+v.id
                })
                const pr = await dashboard.progressById({idproj:""+v.id})
                //console.log(pr);
              const mappr = pr.map(x => Object.fromEntries(Object.entries(x).map(
                ([key, value]) => [key, typeof value == 'string' ? value.replace(/& /g,"").replace(/ /g,"_").toLowerCase() : value]))).map(y=>({[y.NAMAKEGIATAN]:y.PROGRESS}))
             // console.log(mappr);
                const hasil = Object.assign({},...mappr)
                let o = {};
                if (st.length !== 0) {

                    let obj = st[0];
                    Object.keys(obj).forEach((x) => o[x] = !!obj[x]);

                }

                return { ...v, progress_by_step: o,bobot:hasil}
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
   
    options = process.env.NIK_INFO 
  
   await axios.get(options).then((res)=>
    {
       //console.dir(res.data)
       data = res.data
       return data
      })

      
    return data

}

router.get('/project/summaries', async (req, res, next) => {
    try {
        const tahun = req.query.tahun
        const rest = await dashboard.summary({tahun:tahun})
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

router.get('/project/project-mpti', async (req, res, next) => {
  try {
      const tahun = req.query.tahun
      const rest = await dashboard.getProker({tahun:tahun})
      res.status(200).json({
          "status": 200,
          "message": "Status Project by Status MPTI",
          "data":rest
      })
  }catch(err){
      console.error(err)
      next(err)
  }
})

router.get('/project/:id', async (req, res, next) => {
    try {
        
        const datanik = await getinfonik()
        const rows = await dashboard.projectById({ id: req.params.id });
       
        let restrows = []
        await rows.forEach(d=>restrows.push({...d,
            bisnis_owner:datanik.data.find(x=>x.nik===d.bisnis_owner).nama,
            project_mgr:datanik.data.find(x=>x.nik===d.project_mgr).nama
        })
        )
        
      

        const rest = await restrows.map(async(v)=>{
            const st = await dashboard.stepper({
                id: ''+v.id
            })
            const rl = await dashboard.realisasi({
                id: ''+v.id
            })
            
          
            const pr = await dashboard.progressById({idproj:""+v.id})
            console.log(pr);
          const mappr = pr.map(x => Object.fromEntries(Object.entries(x).map(
            ([key, value]) => [key, typeof value == 'string' ? value.replace(/& /g,"").replace(/ /g,"_").toLowerCase() : value]))).map(y=>({[y.NAMAKEGIATAN]:y.PROGRESS}))
         // console.log(mappr);
            const hasil = Object.assign({},...mappr)
            let rlnama = []
            let out = []
           if(rl.length!==0)
           { await rl.forEach(d=>rlnama.push({...d,pelaksana:d.pelaksana+" - "+datanik.data.find(x=>x.nik===d.pelaksana).nama}))
            
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
            }
            let o = {};
            if (st.length !== 0) {

                let obj = st[0];
                Object.keys(obj).forEach((x) => o[x] = !!obj[x]);

            }

            return { ...v,  realisasi:out, progress_by_step: o,bobot:hasil}
    })

    
    Promise.all(rest).then(async (r) => {
        
        res.status(200).json({
            "status": 200,
            "message": "Succcessfully get project by ID : "+req.params.id,
            "data":r})
        })
        .catch(er=>console.error(er))

    } catch (err) {
        const { errorNum } = err;
        if(errorNum){
        console.error(err);
        res.status(500).send("Internal Server Error")
        }
        next(err);
    }
});


router.get('/reportproject', async (req, res, next) => {
    try {
        
        const datanik = await getinfonik()
        //const param = req.query.idproj
        const rows = await dashboard.reportproject();
      // console.dir(rows)
        let restrows = []
        await rows.forEach(d=>restrows.push({...d,
            nama_BPO:datanik.data.find(x=>x.nik===d.nik_BPO).nama,
            divisi_BPO:datanik.data.find(x=>x.nik===d.nik_BPO).organisasi,
            nama_PM:datanik.data.find(x=>x.nik===d.nik_PM).nama,
            divisi_PM:datanik.data.find(x=>x.nik===d.nik_PM).organisasi,
        })
        )
       // console.dir(restrows)
      

        const rest = await restrows.map(async(v)=>{
      
            const pl = await dashboard.reportrencana({
                id: ''+v.id
            })

            const rl = await dashboard.reportrealisasi({
                id: ''+v.id
            })
           
            
         
           
          
            let mappl=[]
            let maprl = []
            let outpl = []
            let outrl = []
            if(pl.length>0){
               
                await pl.forEach((d)=>mappl.push({...d,pelaksana:d.pelaksana+" - "+datanik.data.filter(z=>z.nik === d.pelaksana).map(x=>x.nama).toString() }))
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

                   const hasilpl =  outpl.map(({kegiatan,pelaksana,...rest})=>({[kegiatan]:pelaksana,...rest}))
          
            if(rl.length>0){
               
           await rl.forEach((d)=>maprl.push({...d,pelaksana:d.pelaksana+" - "+datanik.data.filter(z=>z.nik === d.pelaksana).map(x=>x.nama).toString() }))
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

            const hasilrl =  outrl.map(({kegiatan,pelaksana,...rest})=>({[kegiatan]:pelaksana,...rest}))
          //   // let o = {};
            // if (st.length !== 0) {

            //     let obj = st[0];
            //     Object.keys(obj).forEach((x) => o[x] = !!obj[x]);

            // }

            return { ...v,  plan:hasilpl,realisasi:hasilrl}
    })

    
    Promise.all(rest).then(async (r) => {
        
        res.status(200).json({
            "status": 200,
            "message": "Succcessfully get project by ID :",
            "data":r})
        })
        .catch(er=>console.error(er))

    } catch (err) {
        const { errorNum } = err;
        if(errorNum){
        console.error(err);
        res.status(500).send("Internal Server Error")
        }
        next(err);
    }
});

module.exports = router;