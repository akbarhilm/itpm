const database = require('../conf/db/db')
const oracledb = require('oracledb');
//  const aplikasi = require('./aplikasi');
//  const layanan = require('./layanan')
//  const modul = require('./modul') 


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
    
    params.statusproj = "BARU"
    let query =`INSERT INTO DBADMIT.TMITPMPROJ 
    (I_ITPM_SC,    C_ITPM_APPLSTAT, C_ITPM_SC,    N_ITPM_PROJ, E_ITPM_PROJ,
        C_ITPM_PROJSTAT,   D_ITPM_PROJSTATCHNG,
    C_ITPM_ACTV,    N_ITPM_PROJURI,    I_EMP_REQ,    I_EMP_PM`
    if(params.idaplikasi){
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
    sysdate,
    1,
    :namauri,
    :nikreq,
    :nikpm,`
    if(params.idaplikasi){
        query+=`:idaplikasi,`
       }
       else{
           delete params.idaplikasi
       }
       if(params.idmodul){
        query+=` :idmodul,`
    }
    else{
        delete params.idmodul
    }
    query+=`
    :identry,
    sysdate
    )
    returning i_itpm_proj into :idproj`
   params.idproj = {dir:oracledb.BIND_OUT}
   // console.dir(query);
    console.dir(params)  
    const result = await database.seqexec(query,params,[],false)
    
    params.idproj = parseInt(result.outBinds.idproj[0]);

    return params
}

async function edit(params){
    let query=`UPDATE DBADMIT.TMITPMPROJ
    set I_ITPM_SC = :idlayanan,
    C_ITPM_APPLSTAT = :statusapl, 
    C_ITPM_SC = :jenislayanan,    
    N_ITPM_PROJ = :namaproj, 
    E_ITPM_PROJ = :ketproj,
    N_ITPM_PROJURI =:namauri,   
    I_EMP_REQ = :nikreq,    
    I_EMP_PM = :nikpm,
    I_ITPM_APPL = :idaplikasi,
    I_ITPM_MDL = :idmodul,
    I_UPDATE = :idupdate,
    D_UPDATE = sysdate
    where i_itpm_proj = :idproj`
    
    const result = await database.exec(query,params,{autoCommit:true})
    if(result.rowsAffected ==1){
        return params
    }else{
    return result
    }
}

async function addUser(params){
    let query=`insert into dbadmit.tritpmuser (i_emp,c_itpm_actv,i_entry,d_entry,i_emp_email) 
    select :nikpm,1,:identry,sysdate,:emailpm
    from dual
    where not exists(select * 
                     from dbadmit.tritpmuser
                     where i_emp =:nikpm)
    union all
    
    select :nikreq,1,:identry,sysdate,:emailreq
    from dual
    where not exists(select * 
                     from dbadmit.tritpmuser
                     where i_emp =:nikreq)`

        const result = await database.seqexec(query,params,[],false)
        return result;
}

async function addUserAuth(params){
    
    let query=`insert into dbadmit.tritpmuserauth (i_emp,i_itpm_menuauth)
    select i_emp,i_itpm_menuauth from(
        select :nikpm as i_emp, b.i_itpm_menuauth from dbadmit.tritpmmenuauth b, dbadmit.tritpmauth c 
        where  not exists(select * from dbadmit.tritpmuserauth a where a.i_emp = :nikpm and a.i_itpm_menuauth = b.i_itpm_menuauth and b.i_itpm_auth = c.i_itpm_auth and c.c_itpm_auth = 'PM') and b.i_itpm_auth = c.i_itpm_auth and c.c_itpm_auth = 'PM'
        union all
        select :nikreq as i_emp, b.i_itpm_menuauth from dbadmit.tritpmmenuauth b, dbadmit.tritpmauth c 
        where  not exists(select * from dbadmit.tritpmuserauth a where a.i_emp = :nikreq and a.i_itpm_menuauth = b.i_itpm_menuauth and b.i_itpm_auth = c.i_itpm_auth and c.c_itpm_auth = 'BPO') and b.i_itpm_auth = c.i_itpm_auth and c.c_itpm_auth = 'BPO'
        )
        `
    const result = await database.seqexec(query,params,{autoCommit:true},true)
        return result;
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
module.exports.edit = edit
module.exports.addUser = addUser
module.exports.addUserAuth = addUserAuth
module.exports.getdetailbyid = getdetailbyid