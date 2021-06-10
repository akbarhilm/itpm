const database = require('../conf/db/db')
// const aplikasi = require('./aplikasi');
// const modul = require('./modul') 

async function find(params){
    
    let query =`select I_ITPM_PROJ as idproyek,
    I_ITPM_SC as idlayanan,
    C_ITPM_APPLSTAT as kodeaplikasi,
    C_ITPM_SC as kodelayanan,
    N_ITPM_PROJ as namaproyek,
    E_ITPM_PROJ as ketproyek,
    C_ITPM_PROJSTAT as kodestatus,
    E_ITPM_PROJSTATCHNG as ketstatus,
    D_ITPM_PROJSTATCHNG as tglstatus,
    C_ITPM_ACTV as kodeaktif,
    N_ITPM_PROJURI as namauri,
    I_EMP_REQ as nikreq,
    I_EMP_PM as nikpm,
    I_ITPM_RISKNBR as norisk,
    I_ITPM_PLANNBR as noplan,
    I_ITPM_RESRCNBR as nores,
    I_ITPM_REALNBR as noreal,
    I_ITPM_BANBR as noba,
    D_ITPM_BA as tglba,
    C_ITPM_BAAPPRV as kodeaproveba,
    D_ITPM_BAAPPRV as tglaproveba,
    I_ITPM_UREQNBR as noureq,
    I_ITPM_APPL as idaplikasi,
    I_ITPM_MDL as idmodul from DBADMIT.TMITPMPROJ`
    const param ={}
    if(params){
    param.id = params.id

    query+=`\n  where to_char(i_itpm_proj) = :id or n_itpm_projuri =:id`;
    }   
    const result = await database.exec(query,params)
    return result.rows
}

async function add(params){
    let query =`INSERT INTO DBADMIT.TMITPMPROJ 
    (I_ITPM_SC,    C_ITPM_APPLSTAT, C_ITPM_SC,    N_ITPM_PROJ,
    E_ITPM_PROJ,    C_ITPM_PROJSTAT,    E_ITPM_PROJSTATCHNG,    D_ITPM_PROJSTATCHNG,
    C_ITPM_ACTV,    N_ITPM_PROJURI,    I_EMP_REQ,    I_EMP_PM`
    if(params.idpalikasi){
     query+=`,I_ITPM_APPL`
    }
    if(params.idmodul){
        query+=`,I_ITPM_MDL`
    }
        query+=`, I_ENTRY,    D_ENTRY)
    values(
    :idlayanan,
    :statusapl,
    :jenislayanan,
    :namaproj,
    :ketproj,
    :statusproj,
    :ketstatus,
    to_date(:tglstatus,'dd/mm/yyyy'),
    :aktif,
    :namauri,
    :nikreq,
    :nikpm,`
    if(params.idpalikasi){
        query+=`:idpalikasi,`
       }
       if(params.idmodul){
        query+=` :idmodul,`
    }
    query+=`
    :identry,
    sysdate
    )`
    const result = await database.exec(query,params)
    return result.rowsAffected
}

async function stepper(params){

    let query = `SELECT a.I_ITPM_RISKNBR as norisk, a.I_ITPM_PLANNBR as noplan, a.I_ITPM_RESRCNBR as nores,a.I_ITPM_REALNBR as noreal,a.I_ITPM_BANBR as noba,a.I_ITPM_UREQNBR as noureq,b.I_ITPM_CHARTERNBR as nocharter,c.i_itpm_uatnbr as nouat
    from dbadmit.tmitpmproj a
    full outer join DBADMIT.TMITPMCHARTER b on a.i_itpm_proj = b.i_itpm_proj
    full outer join DBADMIT.TMITPMUAT c on c.i_itpm_proj = b.i_itpm_proj
    where to_char(a.i_itpm_proj) = :id or a.n_itpm_projuri =:id`

    const result = await database.exec(query,params)
    return result.rows
}

module.exports.find = find
module.exports.add = add
module.exports.stepper = stepper