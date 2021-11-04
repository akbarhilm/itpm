const database = require('../conf/db/db')
const oracledb = require('oracledb');

async function addBa(params){

    let query = `update dbadmit.tmitpmproj set
        i_itpm_banbr =   (select trim(to_char(nvl(nomer,'1'),'000'))||'/BAST/IT0000/'||to_char(sysdate,'mm')||'/'||to_char(sysdate,'yyyy') as nomer from(
            select trim(to_char(max(substr(i_itpm_banbr ,0,3))+1,'000')) as nomer from dbadmit.tmitpmproj where substr(i_itpm_banbr,-4) = to_char(sysdate,'yyyy')
            )),
        d_itpm_ba = sysdate,
        c_itpm_baapprv = 0
        where i_itpm_proj = :idproj
   `
   const param = {}
   param.idproj = params.idproj
    const result = await database.exec(query,param)
    return result.rowsAffected
    
}

async function failAddBa(params){
    let query = `update dbadmit.tmitpmproj set
        i_itpm_banbr =   null,
        d_itpm_ba = null,
        c_itpm_baapprv = 0
        where i_itpm_proj = :idproj
   `
   const param = {}
   param.idproj = params.idproj
    const result = await database.exec(query,param)
    return result.rowsAffected
}

async function approveBa(params){
    let query=`update dbadmit.tmitpmproj set
    c_itpm_baapprv = 1,
    d_itpm_baapprv = sysdate
    where i_itpm_proj = :idproj`

    const param = {}
   param.idproj = params.idproj
    const result = await database.exec(query,param)
    return result.rowsAffected
}

async function failBa(params){
    let query=`update dbadmit.tmitpmproj set
    c_itpm_baapprv = 0,
    d_itpm_baapprv = null
    where i_itpm_proj = :idproj`

    const param = {}
   param.idproj = params.idproj
    const result = await database.exec(query,param)
    return result.rowsAffected
}

module.exports.failAddBa = failAddBa
module.exports.failBa = failBa
module.exports.addBa = addBa
module.exports.approveBa = approveBa