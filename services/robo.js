const database = require('../conf/db/db')
const oracledb = require('oracledb');

async function findDefLayanan(params) {
    let query = `select a.i_itpm_scnbr as noLayanan, 
        a.e_itpm_sc as ketlayanan from dbadmit.tmitpmsc a, dbadmit.tmitpmproj b 
        where a.I_ITPM_SC = b.i_itpm_sc and b.i_itpm_proj = :idproj`

    const param = {}
    param.idproj = params.idproj
    const result = await database.exec(query, param)
    return result.rows
}
async function newRobo(params) {
    let query = `select b.I_ITPM_PROJ as idproj,
    null as norobo,
    c.E_ITPM_SC as ketlayanan,
    c.n_itpm_mdl as ketmodul,
    case b.c_itpm_sc when 'PENGEMBANGAN' THEN 'BARU'
    else b.c_itpm_sc
     END AS jenislayanan                     
    from DBADMIT.TMITPMPROJ b, DBADMIT.TMITPMSC c
    where 
    b.I_ITPM_PROJ = :idproj
    and b.i_itpm_sc = c.I_itpm_sc`

    const param = {}
    param.idproj = params.idproj
    const result = await database.exec(query, param)
    return result.rows
}
//////////////TMITPMROBO//////////////////////////////
async function findRoboMaster(params) {
    let query = `select a.I_ITPM_IDROBO as idrobo,
    a.I_ITPM_ROBONBR as norobo,
    a.I_ITPM_PROJ as idproj,
    a.E_ITPM_ROBOSRV as ketlayanan,
    a.E_ITPM_ROBOMDL as ketmodul,
    case b.c_itpm_sc when 'PENGEMBANGAN' THEN 'BARU'
    else b.c_itpm_sc
     END AS jenislayanan                     
    from DBADMIT.TMITPMROBO a, DBADMIT.TMITPMPROJ b
    where 
    a.I_ITPM_PROJ = :idproj
    and a.I_ITPM_PROJ = b.I_ITPM_PROJ
    
                `
    const param = {}
    param.idproj = params.idproj

    const result = await database.exec(query, param)
    return result.rows

}

async function noRobo() {
    let query = `select trim(to_char(nvl(nomer,'1'),'000'))||'/ROP/IT0000/'||to_char(sysdate,'mm')||'/'||to_char(sysdate,'yyyy') as norobo from(
        select trim(to_char(max(substr(i_itpm_robonbr ,0,3))+1,'000')) as nomer, null as tahun from dbadmit.TMITPMROBO where substr(i_itpm_robonbr,-4) = to_char(sysdate,'yyyy')
        )
    `
    const result = await database.exec(query)
    return result.rows
}


async function addRoboMaster(params, commit, conn) {
    const norobo = await noRobo()
    
    let query = `insert into DBADMIT.TMITPMROBO (
        I_ITPM_ROBONBR,
        I_ITPM_PROJ,
        E_ITPM_ROBOSRV,
        E_ITPM_ROBOMDL,
        I_ENTRY,
        D_ENTRY
        )values(
            :norobo,
            :idproj,
            :ketlayanan,
            :ketmodul,
            :identry,
            sysdate
        )returning I_ITPM_IDROBO into :idrobo`

    const param = {}
    param.norobo = norobo[0].NOROBO
    param.idproj = params.idproj
    param.ketlayanan = params.ketlayanan
    param.ketmodul = params.ketmodul
    param.identry = params.identry

    param.idrobo = { dir: oracledb.BIND_OUT }
    
    const result = await database.seqexec(query, param, commit, conn)
    
    param.idrobo = result.outBinds.idrobo[0];
    return param
}

async function updateRoboMaster(params, commit, conn){
    let query = `update dbadmit.tmitpmrobo set 
                    E_ITPM_ROBOSRV = :ketlayanan,
                    E_ITPM_ROBOMDL = :ketmodul,
                    I_UPDATE = :identry,
                    D_UPDATE = sysdate
                where I_ITPM_PROJ = :idproj`
    const param = {}
    param.ketlayanan = params.ketlayanan
    param.ketmodul = params.ketmodul
    param.identry = params.identry
    param.idproj = params.idproj

    const result = await database.seqexec(query, param, commit, conn)
    
    return param
}
///////////////////////////end/////////////////////////////

//////////////////// TMITPMROBOROLERESP  //////////////////////
async function findRoboResp(params) {

    let query = `select i_itpm_idrobo as idrobo,C_ITPM_ACTOR as kodeactor,i_emp_assign as nik,
    case c_itpm_actor when '0' then 'PM'
                when '1' then 'SA'
                when '2' then 'QA'
                when '3' then 'Sysadmin'
                when '4' then 'DBA'
                when '5' then 'Pentester'
                end as namaactor,   
    listagg('- '||E_ITPM_ROLERESP, ', ') within group (order by i_itpm_nourut) as ketrole,
    listagg(i_Itpm_idroroleresp, ',') within group (order by i_itpm_nourut) as IDROLERESP
    from dbadmit.TMITPMROBOROLERESP 
    where I_ITPM_IDROBO = :idrobo
    group by C_ITPM_ACTOR,i_itpm_idrobo,i_emp_assign`

    const param = {}
    param.idrobo = params.idrobo

    const result = await database.exec(query, param)
    return result.rows
}
async function addRoboResp(params, commit, conn) {
    let query = `insert into DBADMIT.TMITPMROBOROLERESP (
        I_ITPM_IDROBO,
        I_ITPM_IDROROLERESP,
        C_ITPM_ACTOR,
        I_ITPM_NOURUT,
        E_ITPM_ROLERESP,
        I_EMP_ASSIGN,
        I_ENTRY,
        D_ENTRY
    )values(
        :idrobo,
        :idroleresp,
        :kodeactor,
        :nourut,
        :ketrole,
        :nik,
        :identry,
        sysdate
    )`

    const param = {}
    param.idrobo = params.idrobo
    param.idroleresp = params.idroleresp
    param.kodeactor = params.kodeactor
    param.nourut = params.nourut
    param.ketrole = params.ketrole
    param.nik = params.nik
    param.identry = params.identry
    
    //param.idroboroleresp = { dir: oracledb.BIND_OUT }
    const result = await database.seqexec(query, param, commit, conn)
    //param.idroboroleresp = result.outBinds.idroboroleresp[0];
    
    return param
}
///////////////// END OF TMITPMROBOROLERESP /////////////////////////

////////////////// TMITPMROBOACT ////////////////////////
async function findRoboAct(params) {
    let query = `select i_itpm_idroboact as idroboact,
    i_itpm_idrobo as idrobo,
    i_itpm_idroact as idroact,
    n_itpm_act as namaact,
    e_itpm_roboact as ketact,
    n_tanggungjawab as namatj,
    n_pihakterlibat as namapt,
    to_char(d_itpm_actystart,'dd/mm/ yyyy') as tglmulai,
    to_char(d_itpm_actyfinish,'dd/mm/ yyyy') as tglselesai,
    c_itpm_actv as kodeaktif
    from dbadmit.TMITPMROBOACT 
    where i_itpm_idrobo = :idrobo`

    const param = {}
    param.idrobo = params.idrobo

    const result = await database.exec(query, param)
    return result.rows
}

async function addRoboAct(params, commit, conn) {
    let query = `insert into DBADMIT.TMITPMROBOACT (
        I_ITPM_IDROBO,
        I_ITPM_IDROACT,
        N_ITPM_ACT,
        E_ITPM_ROBOACT,
        N_TANGGUNGJAWAB,
        N_PIHAKTERLIBAT,
        D_ITPM_ACTYSTART,
        D_ITPM_ACTYFINISH,
        C_ITPM_ACTV,
        I_ENTRY,
        D_ENTRY
    )values(
        :idrobo,
        :idroact,
        :namaact,
        :ketact,
        :namatj,
        :namapihak,
        to_date(:tglmulai,'dd/mm/yyyy'),
        to_date(:tglselesai,'dd/mm/yyyy'),
        1,
        :identry,
        sysdate
    )`

    const param = {}
    param.idrobo = params.idrobo
    param.idroact = params.idroact
    param.namaact = params.namaact
    param.ketact = params.ketact
    param.namatj = params.namatj
    param.namapihak = params.namapt
    param.tglmulai = params.tanggalMulai
    param.tglselesai = params.tanggalSelesai
    param.identry = params.identry
    //    console.dir(param)
    //param.idroboact = { dir: oracledb.BIND_OUT }
    
    const result = await database.seqexec(query, param, commit, conn)
   // param.idroboact = result.outBinds.idroboact[0];
    return param
}
///////////////////// end of TMITPMROBOACT //////////////////////////////

//////////////////////// TMITPMROBOPLAN ///////////////////////////////
async function findBoPlan(params) {
    let query = `select i_itpm_idrobo as idrobo,n_itpm_tahapan as namatahap,
    listagg('- '||e_itpm_Plan, ', ') within group (order by i_itpm_nourut) as ketplan,
    listagg(I_ITPM_IDBOPLAN, ',') within group (order by i_itpm_nourut) as idboplan,
    nvl(c_itpm_hasil,'') as kodehasil, nvl(e_itpm_hasil,'') as kethasil
    from dbadmit.TMITPMROBOPLAN
    where i_itpm_idrobo = :idrobo 
group by n_itpm_tahapan,i_itpm_idrobo,c_itpm_hasil,E_ITPM_HASIL`

    const param = {}
    param.idrobo = params.idrobo

    const result = await database.exec(query, param)
    return result.rows
}
async function addBOPlan(params, commit, conn) {
    let query = `insert into DBADMIT.TMITPMROBOPLAN (
        I_ITPM_IDROBO,
        I_ITPM_IDBOPLAN,
        N_ITPM_TAHAPAN,
        I_ITPM_NOURUT,
        E_ITPM_PLAN,
        C_ITPM_HASIL,
        E_ITPM_HASIL,
        I_ENTRY,
        D_ENTRY
    )values(
        :idrobo,
        :idboplan,
        :namatahapan,
        :nourut,
        :ketplan,
        :kodehasil,
        :kethasil,
        :identry,
        sysdate
    )`

    const param = {}
    param.idrobo = params.idrobo
    param.idboplan = params.idboplan
    param.namatahapan = params.namatahap
    param.ketplan = params.ketplan
    param.kodehasil = params.kodehasil
    param.kethasil = params.kethasil
    param.nourut = params.nourut
    param.identry = params.identry

    //param.idroboplan = { dir: oracledb.BIND_OUT }
    //console.dir(param)
    const result = await database.seqexec(query, param, commit, conn)
    //param.idroboplan = result.outBinds.idroboplan[0];
    return param
}
///////////// TRITPMBOPLAN ///////////////
async function findRefBoPlan() {
    let query = `select n_itpm_tahapan as namatahap,
    listagg('- '||e_itpm_boplan, ', ') within group (order by i_itpm_nourut) as ketplan,
    listagg(I_ITPM_IDBOPLAN, ',') within group (order by i_itpm_nourut) as idboplan
    from dbadmit.TrITPMBOPLAN 
group by n_itpm_tahapan`

    const param = {}
    const result = await database.exec(query, param)
    return result.rows

}

async function addRefBoPlan(params, commit) {
    let query = `insert into DBADMIT.TRITPMBOPLAN (
        N_ITPM_TAHAPAN,
        I_ITPM_NOURUT,
        E_ITPM_BOPLAN,
        C_ITPM_ACTV,
        I_ENTRY,
        D_ENTRY
    )values(
        :namatahapan,
        :nourut,
        :ketboplan,
        1,
        :identry,
        sysdate
    )`

    const param = {}
    param.namatahapan = params.namatahapan
    param.nourut = params.nourut
    param.ketboplan = params.ketboplan
    param.identry = params.identry

    param.idboplan = { dir: oracledb.BIND_OUT }

    const result = await database.exec(query, params, commit)
    param.idboplan = result.outBinds.idboplan[0];
    return param
}
///////////////////////////////end/////////////////////////

///////////////////TRITPMROACT/////////////////////////////////////
async function findRefRoAct() {
    let query = `Select i_Itpm_idroact as idroact,
    n_itpm_act as namaact,     
     e_itpm_roact as ketact,
     n_tanggungjawab as namatj,
     n_pihakterlibat as namapt  from  dbadmit.TRITPMROACT 
     `//Where not exists ( select 1 from  dbadmit.TMITPMROBOACT  b , dbadmit.TMITPMROBO c
    // where a.i_Itpm_idroact = b.i_Itpm_idroact 
    // and b.i_itpm_idrobo = c.i_itpm_idrobo and c.i_itpm_proj = :idproj)`

    const param = {}
    //param.idproj = params.idproj
    const result = await database.exec(query, param)
    return result.rows

}
async function addRefRoAct(params, commit) {
    let query = `insert into DBADMIT.TRITPMROACT (
        N_ITPM_ACT,
        E_ITPM_ROACT,
        N_TANGGUNGJAWAB,
        N_PIHAKTERLIBAT,
        C_ITPM_ACTV,
        I_ENTRY,
        D_ENTRY
    )values(
        :namaact,
        :ketact,
        :namatj,
        :namapihak,
        1,
        :identry,
        sysdate
    )`

    const param = {}
    param.namaact = params.namaact
    param.ketact = params.ketact
    param.namatj = params.namatj
    param.namapihak = params.namapihak
    param.identry = params.identry

    param.idroact = { dir: oracledb.BIND_OUT }

    const result = await database.exec(query, params, commit)
    param.idroact = result.outBinds.idroact[0];
    return param
}
//////////////////////////TRITPMROROLERESP////////////////////////////
async function findRefRole() {
    let query = ` select C_ITPM_ACTOR as kodeactor,
    case c_itpm_actor when '0' then 'PM'
                when '1' then 'SA'
                when '2' then 'QA'
                when '3' then 'Sysadmin'
                when '4' then 'DBA'
                when '5' then 'Pentester'
                end as namaactor,   
    listagg('- '||E_ITPM_ROLERESP, ', ') within group (order by i_itpm_nourut) as ketrole,
    listagg(i_Itpm_idroroleresp, ',') within group (order by i_itpm_nourut) as IDROLERESP
    from dbadmit.TRITPMROROLERESP 
    group by C_ITPM_ACTOR`//Where not exists ( select 1 from  dbadmit.TMITPMROBOROLERESP  b , dbadmit.TMITPMROBO c
    //where a.I_ITPM_IDROROLERESP = b.I_ITPM_IDROROLERESP 
    //and b.i_itpm_idrobo = c.i_itpm_idrobo and c.i_itpm_proj = :idproj)`
    const param = {}
    //param.idproj = params.idproj

    const result = await database.exec(query, param)
    return result.rows
}
async function addRefRole(params, commit) {
    let query = `insert into DBADMIT.TRITPMROROLERESP(
        C_ITPM_ACTOR,
        I_ITPM_NOURUT,
        E_ITPM_ROLERESP,
        C_ITPM_ACTV,
        I_ENTRY,
        D_ENTRY
    )values(
        :kodeactor,
        :nourut,
        :ketrole,
        1,
        :identry,
        sysdate
    )`

    const param = {}
    param.kodeactor = params.kodeactor
    param.nourut = params.nourut
    param.ketrole = params.ketrole
    param.identry = params.identry

    param.idrorole = { dir: oracledb.BIND_OUT }

    const result = await database.exec(query, params, commit)
    param.idrorole = result.outBinds.idrorole[0];
    return param
}

async function deleteMaster(param){
    let query=`delete from DBADMIT.TMITPMROBO where i_itpm_idrobo = :idrobo`
    const result = await database.exec(query, param)
    return result.rows
}
async function deleteResp(param){
    let query=`delete from DBADMIT.TMITPMROBOROLERESP where i_itpm_idrobo = :idrobo`
    const result = await database.exec(query, param)
    return result.rows
}
async function deleteAct(param){
    let query=`delete from DBADMIT.TMITPMROBOACT where i_itpm_idrobo = :idrobo`
    const result = await database.exec(query, param)
    return result.rows
}
async function deleteBO(param){
    let query=`delete from DBADMIT.TMITPMROBOPLAN where i_itpm_idrobo = :idrobo`
    const result = await database.exec(query, param)
    return result.rows
}

module.exports.deleteMaster = deleteMaster
module.exports.deleteResp = deleteResp
module.exports.deleteAct = deleteAct
module.exports.deleteBO = deleteBO
module.exports.findRefBoPlan = findRefBoPlan
module.exports.findRefRoAct = findRefRoAct
module.exports.findRefRole = findRefRole
module.exports.newRobo = newRobo
module.exports.findBoPlan = findBoPlan
module.exports.findRoboAct = findRoboAct
module.exports.findRoboResp = findRoboResp
module.exports.findDefLayanan = findDefLayanan
module.exports.findRoboMaster = findRoboMaster
module.exports.addRoboMaster = addRoboMaster
module.exports.addRoboResp = addRoboResp
module.exports.addRoboAct = addRoboAct
module.exports.addRefBoPlan = addRefBoPlan
module.exports.addRefRoAct = addRefRoAct
module.exports.addRefRole = addRefRole
module.exports.addBOPlan = addBOPlan
module.exports.updateRoboMaster = updateRoboMaster

