const database = require('../conf/db/db')
const oracledb = require('oracledb');
const nomer = require('./nomer');
const { autoCommit } = require('oracledb');
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
    to_char(D_ITPM_PROJSTATCHNG,'dd/mm/yyyy') as tglstatus,
    C_ITPM_ACTV as kodeaktif,
    N_ITPM_PROJURI as namauri,
    I_EMP_REQ as nikreq,
    I_EMP_PM as nikpm,
    I_ITPM_RISKNBR as norisk,
    I_ITPM_PLANNBR as noplan,
    I_ITPM_RESRCNBR as nores,
    I_ITPM_REALNBR as noreal,
    I_ITPM_BANBR as noba,
    to_char(D_ITPM_BA,'dd/mm/yyyy') as tglba,
    C_ITPM_BAAPPRV as kodeaproveba,
    to_char(D_ITPM_BAAPPRV,'dd/mm/yyyy') as tglaproveba,
    I_ITPM_UREQNBR as noureq,
    I_ITPM_APPL as idaplikasi,
    I_ITPM_MDL as idmodul from DBADMIT.TMITPMPROJ`
    const param ={}
    if(params){
    param.id = params.id

    query+=`\n  where to_char(i_itpm_proj) = :id or n_itpm_projuri =:id`;
    }   
    const result = await database.exec(query,param)
    console.dir(result)
    return result.rows
}

async function add(params,commit,conn){
    
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
    const result = await database.seqexec(query,params,commit,conn)
    
    params.idproj = parseInt(result.outBinds.idproj[0]);

    return params
}

async function addNumber(params,commit,conn){

    const res = await nomer.getNomer(params,conn)

    let query=`UPDATE DBADMIT.TMITPMPROJ
    set I_ITPM_`+params.field+`NBR = nvl(I_ITPM_`+params.field+`NBR,:nomer)
    where i_itpm_proj = :idproj
    and I_ITPM_`+params.field+`NBR is null`
    const param = {}
    param.nomer = res[0]
    param.idproj = params.idproj 

    const result = await database.seqexec(query,param,commit,conn)
    return res[0]

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

async function addUser(params,commit,conn){
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

        const result = await database.seqexec(query,params,commit,conn)
        return result;
}

async function addUserAuth(params,commit,conn){
    
    let query=`insert into dbadmit.tritpmuserauth (i_emp,i_itpm_menuauth)
    select i_emp,i_itpm_menuauth from(
        select :nikpm as i_emp, b.i_itpm_menuauth from dbadmit.tritpmmenuauth b, dbadmit.tritpmauth c 
        where  not exists(select * from dbadmit.tritpmuserauth a where a.i_emp = :nikpm and a.i_itpm_menuauth = b.i_itpm_menuauth and b.i_itpm_auth = c.i_itpm_auth and c.c_itpm_auth = 'PM') and b.i_itpm_auth = c.i_itpm_auth and c.c_itpm_auth = 'PM'
        union all
        select :nikreq as i_emp, b.i_itpm_menuauth from dbadmit.tritpmmenuauth b, dbadmit.tritpmauth c 
        where  not exists(select * from dbadmit.tritpmuserauth a where a.i_emp = :nikreq and a.i_itpm_menuauth = b.i_itpm_menuauth and b.i_itpm_auth = c.i_itpm_auth and c.c_itpm_auth = 'BPO') and b.i_itpm_auth = c.i_itpm_auth and c.c_itpm_auth = 'BPO'
        )
        `
    const result = await database.seqexec(query,params,commit,conn)
        return result;
}

async function stepper(params,commit,conn){

    let query = `SELECT a.I_ITPM_RISKNBR as norisk, a.I_ITPM_PLANNBR as noplan, a.I_ITPM_RESRCNBR as nores,a.I_ITPM_REALNBR as noreal,a.I_ITPM_BANBR as noba,a.I_ITPM_UREQNBR as noureq,b.I_ITPM_CHARTERNBR as nocharter,c.i_itpm_uatnbr as nouat, to_number(a.c_itpm_baapprv) as approveba, to_number(b.c_itpm_apprv) as approvecharter
    from dbadmit.tmitpmproj a
    full outer join DBADMIT.TMITPMCHARTER b on a.i_itpm_proj = b.i_itpm_proj
    full outer join DBADMIT.TMITPMUAT c on c.i_itpm_proj = b.i_itpm_proj
    where to_char(a.i_itpm_proj) = :id or a.n_itpm_projuri =:id`

    const result = await database.exec(query,params)
    return result.rows
}

async function updateStatus(params,commit,conn){
    let query=`update dbadmit.tmitpmproj set c_itpm_projstat = :status, e_itpm_projstatchng = :ket, d_itpm_projstatchng = sysdate
    where i_itpm_proj = :idproj`

    const param={}
    param.idproj = params.idproj
    param.status = params.status
    param.ket = params.ket || ''

    const result = await database.seqexec(query,param,commit,conn)
    return result.rowsAffected
}

async function updateStatusBa(params,commit){
    let query=`update dbadmit.tmitpmproj set c_itpm_projstat = :status, d_itpm_projstatchng = sysdate
    where i_itpm_proj = :idproj`

    const param={}
    param.idproj = params.idproj
    param.status = params.status

    const result = await database.exec(query,param,commit)
    return result.rowsAffected
}

async function delproyek(param){
    let query =`delete dbadmit.tmitpmproj where i_itpm_proj = :idproj`
    const result = await database.exec(query,param)
    return result.rows
}

async function proyekByNik(param){
    let query = `select a.I_ITPM_PROJ as idproyek,
    a.C_ITPM_APPLSTAT as jenisproj,
    b.I_ITPM_SCNBR as nolayanan,
    a.N_ITPM_PROJ as namaproyek,
    a.E_ITPM_PROJ as ketproyek,
    a.C_ITPM_ACTV as kodeaktif,
    a.N_ITPM_PROJURI as namauri,
    a.C_ITPM_PROJSTAT as statusproyek  
    from dbadmit.tmitpmproj a, DBADMIT.TMITPMSC b
    where a.I_ITPM_SC = b.I_ITPM_SC and  a.i_itpm_proj in (
        select i_itpm_proj  from dbadmit.tmitpmproj where :nik in (i_emp_req, i_emp_pm)
        union
        select distinct I_itpm_proj from dbadmit.tmitpmplanreal where i_emp_actyassign = :nik
        union
        select distinct I_itpm_proj from dbadmit.tmitpmuat where i_emp_qa = :nik
        union
        select distinct b.I_itpm_proj from dbadmit.tmitpmuatdtl a,dbadmit.tmitpmuat b where a.i_emp_uat = :nik and a.i_itpm_uat = b.i_itpm_uat
        )
        order by a.d_entry desc`


        const result = await database.exec(query,param)
        const list = {"list":result.rows}
        return list
}

async function summaryByPm(){
    let query = `
            select nikpm, baru, berjalan,pending,selesai, (baru+berjalan+pending+selesai) as total from (
            select nikpm, nvl(sum(baru),0) as baru, nvl(sum(berjalan),0) as berjalan, nvl(sum(pending),0) as pending, nvl(sum(selesai),0) as selesai from (
            select i_emp_pm as nikpm, count(C_ITPM_PROJSTAT) as baru , null as berjalan, null as pending, null as selesai from DBADMIT.TMITPMPROJ where C_ITPM_PROJSTAT = 'BARU'
            group by i_emp_pm
            union all
            select i_emp_pm as nikpm, null as baru , count(C_ITPM_PROJSTAT) as berjalan, null as pending, null as selesai from DBADMIT.TMITPMPROJ where C_ITPM_PROJSTAT = 'BERJALAN'
            group by i_emp_pm
            union all 
            select i_emp_pm as nikpm, null as baru , null as berjalan, count(C_ITPM_PROJSTAT) as pending, null as selesai from DBADMIT.TMITPMPROJ where C_ITPM_PROJSTAT = 'PENDING'
            group by i_emp_pm
            union all
            select i_emp_pm as nikpm, null as baru , null as berjalan, null as pending, count(C_ITPM_PROJSTAT) as selesai from DBADMIT.TMITPMPROJ where C_ITPM_PROJSTAT = 'SELESAI'
            group by i_emp_pm
            )
            group by nikpm
            )`
    const result = await database.exec(query,{})
    return result.rows
    
}

async function summaryByKategori(){
    let query=`select kategori, baru, berjalan,pending,selesai, (baru+berjalan+pending+selesai) as total from (
        select kategori, nvl(sum(baru),0) as baru, nvl(sum(berjalan),0) as berjalan, nvl(sum(pending),0) as pending, nvl(sum(selesai),0) as selesai from (
        select C_ITPM_APPLSTAT as kategori, count(C_ITPM_PROJSTAT) as baru , null as berjalan, null as pending, null as selesai from DBADMIT.TMITPMPROJ where C_ITPM_PROJSTAT = 'BARU'
        group by C_ITPM_APPLSTAT
        union all
        select C_ITPM_APPLSTAT as kategori, null as baru , count(C_ITPM_PROJSTAT) as berjalan, null as pending, null as selesai from DBADMIT.TMITPMPROJ where C_ITPM_PROJSTAT = 'BERJALAN'
        group by C_ITPM_APPLSTAT
        union all 
        select C_ITPM_APPLSTAT as kategori, null as baru , null as berjalan, count(C_ITPM_PROJSTAT) as pending, null as selesai from DBADMIT.TMITPMPROJ where C_ITPM_PROJSTAT = 'PENDING'
        group by C_ITPM_APPLSTAT
        union all
        select C_ITPM_APPLSTAT as kategori, null as baru , null as berjalan, null as pending, count(C_ITPM_PROJSTAT) as selesai from DBADMIT.TMITPMPROJ where C_ITPM_PROJSTAT = 'SELESAI'
        group by C_ITPM_APPLSTAT
        )
        group by kategori
        )`
    const result = await database.exec(query,{})
    return result.rows
}

async function summaryByYear(){
    let query=`select tahun, baru, berjalan,pending,selesai, (baru+berjalan+pending+selesai) as total from (
        select tahun, nvl(sum(baru),0) as baru, nvl(sum(berjalan),0) as berjalan, nvl(sum(pending),0) as pending, nvl(sum(selesai),0) as selesai from (
        select to_char(D_ENTRY,'yyyy') as tahun , count(C_ITPM_PROJSTAT) as baru , null as berjalan, null as pending, null as selesai from DBADMIT.TMITPMPROJ where C_ITPM_PROJSTAT = 'BARU'
        group by d_entry
        union all
        select to_char(D_ENTRY,'yyyy') as tahun , null as baru , count(C_ITPM_PROJSTAT) as berjalan, null as pending, null as selesai from DBADMIT.TMITPMPROJ where C_ITPM_PROJSTAT = 'BERJALAN'
        group by d_entry
        union all 
        select to_char(D_ENTRY,'yyyy') as tahun , null as baru , null as berjalan, count(C_ITPM_PROJSTAT) as pending, null as selesai from DBADMIT.TMITPMPROJ where C_ITPM_PROJSTAT = 'PENDING'
        group by d_entry
        union all
        select to_char(D_ENTRY,'yyyy') as tahun , null as baru , null as berjalan, null as pending, count(C_ITPM_PROJSTAT) as selesai from DBADMIT.TMITPMPROJ where C_ITPM_PROJSTAT = 'SELESAI'
        group by d_entry
        )
        group by tahun
        )`
    const result = await database.exec(query,{})
    console.dir(result.rows)
    return result.rows
    
}

async function summaryByDev(){
    let query = `select nik, baru, berjalan,pending,selesai, (baru+berjalan+pending+selesai) as total from (
    SELECT i_emp_actyassign as nik, sum(baru) as baru, sum(berjalan) as berjalan, sum(pending) as pending, sum(selesai) as selesai from (
        select i_emp_actyassign, COUNT(a.C_ITPM_PROJSTAT) as baru, 0 as berjalan, 0 as pending, 0 as selesai from dbadmit.tmitpmproj a, dbadmit.tmitpmplanreal b  where C_ITPM_PROJSTAT = 'BARU' and  a.i_itpm_proj = b.i_itpm_proj and C_ITPM_PLANREAL = 'REALISASI' and i_itpm_acty = 4
        group by i_emp_actyassign
        union all
        select i_emp_actyassign, 0 as baru, COUNT(a.C_ITPM_PROJSTAT) as berjalan, 0 as pending, 0 as selesai from dbadmit.tmitpmproj a, dbadmit.tmitpmplanreal b  where C_ITPM_PROJSTAT = 'BERJALAN' and  a.i_itpm_proj = b.i_itpm_proj and C_ITPM_PLANREAL = 'REALISASI' and i_itpm_acty = 4
        group by i_emp_actyassign
        union all
        select i_emp_actyassign, 0 as baru, 0 as berjalan, COUNT(a.C_ITPM_PROJSTAT) as pending, 0 as selesai from dbadmit.tmitpmproj a, dbadmit.tmitpmplanreal b  where C_ITPM_PROJSTAT = 'PENDING' and  a.i_itpm_proj = b.i_itpm_proj and C_ITPM_PLANREAL = 'REALISASI' and i_itpm_acty = 4
        group by i_emp_actyassign
        union all
        select i_emp_actyassign, 0 as baru, 0 as berjalan, 0 as pending, COUNT(a.C_ITPM_PROJSTAT) as selesai from dbadmit.tmitpmproj a, dbadmit.tmitpmplanreal b  where C_ITPM_PROJSTAT = 'SELESAI' and  a.i_itpm_proj = b.i_itpm_proj and C_ITPM_PLANREAL = 'REALISASI' and i_itpm_acty = 4
        group by i_emp_actyassign)
        group by i_emp_actyassign)`
    const result = await database.exec(query,{})
    return result.rows
}

module.exports.summaryByDev = summaryByDev
module.exports.summaryByYear = summaryByYear
module.exports.summaryByKategori = summaryByKategori
module.exports.summaryByPm = summaryByPm
module.exports.proyekByNik = proyekByNik
module.exports.delproyek = delproyek
module.exports.find = find
module.exports.add = add
module.exports.stepper = stepper
module.exports.edit = edit
module.exports.addUser = addUser
module.exports.addUserAuth = addUserAuth
module.exports.addNumber = addNumber
module.exports.updateStatus = updateStatus
module.exports.updateStatusBa = updateStatusBa
