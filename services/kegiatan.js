const database = require('../conf/db/db')
const oracledb = require('oracledb');

async function find(params){
    let query=` select  i_itpm_acty as idkegiatan,
    n_itpm_acty as namakegiatan,
    n_itpm_actytarget as namatarget,
    v_itpm_bobot as nilaibobot,
    c_itpm_actv kodeaktif
     from dbadmit.tritpmacty`
     const param ={}
     if (Object.keys(params).some(function(k) {return params[k];})) {
         // console.dir(!!params)
         query += `\n where`;
         if (Object.keys(params).find((x) => x == "namakegiatan")) {
             query += `\n lower(n_itpm_acty) like '%'||lower(:namakegiatan)||'%'`;
             param.namakegiatan = params.namakegiatan
         }
 
         if (Object.keys(params).find((x) => x == "idkegiatan")) {
             query += `\n i_itpm_acty = :idkegiatan`;
             param.idpidkegiatanlanreal = params.idkegiatan
         }
     }
     //.dir(query)
 
     const result = await database.exec(query,param)
     return result.rows;
}

async function add(params){
    let query=`insert into dbadmit.tritpmacty(
    n_itpm_acty,
    n_itpm_actytarget,
    c_itpm_actv,
    i_entry,
    d_entry)
    values(
    :namakegiatan,
    :namatarget,
    1,
    :identry,
    sysdate
    ) returning i_itpm_acty into :idkegiatan`

    const param = {}
    param.namakegiatan = params.namakegiatan
    param.namatarget = params.namatarget
    param.identry = params.identry
    

    param.idkegiatan = { dir: oracledb.BIND_OUT }

    const result = await database.exec(query, param)
    param.idkegiatan = result.outBinds.idkegiatan[0];
    return param
}

async function del(params){
    let query=`delete dbadmit.tritpmacty where i_itpm_acty = :idkegiatan`
    const param={}
    param.idkegiatan = params.idkegiatan

    const res = await database.exec(query,param)
    return res.rowsAffected
}

module.exports.del = del
module.exports.add = add
module.exports.find = find
