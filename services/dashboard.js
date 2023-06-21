const database = require('../conf/db/db')
const oracledb = require('oracledb');




async function listProyek(){
    let query =`select a.I_ITPM_PROJ as "id",
    b.I_ITPM_SCNBR as "no_layanan",
    N_ITPM_PROJ as "nama_proyek",
    E_ITPM_PROJ as "keterangan",
    C_ITPM_PROJSTAT as "status",
    to_char(c.D_ITPM_CHARTERSTART,'dd/mm/yyyy') as "tanggal_mulai",
    to_char(c.D_ITPM_CHARTERFINISH,'dd/mm/yyyy') as "tanggal_selesai"

    from DBADMIT.TMITPMPROJ a, DBADMIT.TMITPMSC b, DBADMIT.TMITPMCHARTER c
    where a.i_itpm_sc = b.i_Itpm_sc and a.i_itpm_proj = c.i_itpm_proj`

    const result = await database.exec(query)
    console.dir(result)
    return result.rows
}


async function stepper(params){

    let query = `SELECT a.I_ITPM_UREQNBR as "user_req",b.I_ITPM_CHARTERNBR as "charter",a.I_ITPM_PLANNBR as "plan", a.I_ITPM_RISKNBR as "risk",  a.I_ITPM_RESRCNBR as "resources",a.I_ITPM_REALNBR as "realisasi",a.I_ITPM_BANBR as "berita_acara",d.i_itpm_robonbr as "backout",c.i_itpm_uatnbr as "uat"
    from dbadmit.tmitpmproj a
    full outer join DBADMIT.TMITPMCHARTER b on a.i_itpm_proj = b.i_itpm_proj
    full outer join DBADMIT.TMITPMUAT c on c.i_itpm_proj = b.i_itpm_proj
    full outer join DBADMIT.TMITPMROBO d on d.i_itpm_proj = b.i_itpm_proj
    where to_char(a.i_itpm_proj) = :id or a.n_itpm_projuri =:id`

    const result = await database.exec(query,params)
    return result.rows
}


async function projectById(params){
    let query =`select a.I_ITPM_PROJ as "id",
    b.I_ITPM_SCNBR as "no_layanan",
    a.C_ITPM_SC as "type_layanan",
    C_ITPM_APPLSTAT as "jenis_app",
    d.N_ITPM_MDL as "jenis_app",
    N_ITPM_PROJ as "nama_proyek",
    E_ITPM_PROJ as "keterangan",
    C_ITPM_PROJSTAT as "status",
    a.I_EMP_REQ as "bisnis_owner",
    a.I_EMP_PM as "project_mgr",
    to_char(c.D_ITPM_CHARTERSTART,'dd/mm/yyyy') as "tanggal_mulai",
    to_char(c.D_ITPM_CHARTERFINISH,'dd/mm/yyyy') as "tanggal_selesai"

    from DBADMIT.TMITPMPROJ a, DBADMIT.TMITPMSC b, DBADMIT.TMITPMCHARTER c,dbadmit.tritpmmdl d
    where a.i_itpm_sc = b.i_Itpm_sc and a.i_itpm_proj = c.i_itpm_proj and a.i_Itpm_mdl = d.i_itpm_mdl
    and a.I_itpm_proj = :id`
    console.dir("byid")
    const param = {}
    param.id = params.id
    const result = await database.exec(query,param)
    return result.rows

}


async function realisasi(params) {

    let query = `select
    b.n_itpm_acty as "kegiatan",  
    i_emp_actyassign as "pelaksana", 
    to_char(d_itpm_actystart,'dd/mm/yyyy') as "tanggal_mulai", 
    to_char(d_itpm_actyfinish,'dd/mm/yyyy') as "tanggal_selesai" 
    from dbadmit.tmitpmplanreal a, dbadmit.tritpmacty b
    where c_itpm_planreal = 'REALISASI' and
    I_ITPM_PROJ = :idproj and A.I_ITPM_ACTY = B.I_ITPM_ACTY`;

    const param = {}
    param.idproj = params.id
    
    const result = await database.exec(query, param);
    return result.rows;
}

async function summary(){

    
    let query=`SELECT SUM(total) as "proyek total",sum(baru) as "proyek baru" , sum(berjalan) as "proyek_berjalan", sum(pending) as "proyek pending", sum(selesai) as "proyek selesai" from (
        select count(*) as total,0 as baru, 0 as berjalan, 0 as pending, 0 as selesai,i_emp_req,i_emp_pm from DBADMIT.TMITPMPROJ
        group by i_emp_req,i_emp_pm
        union all
        
        select 0 as total, count(*) as baru, 0 as berjalan, 0 as pending, 0 as selesai,i_emp_req,i_emp_pm from DBADMIT.TMITPMPROJ WHERE C_ITPM_PROJSTAT = 'BARU' 
        group by i_emp_req,i_emp_pm
        union all
        
        select 0 as total, 0 as baru, count(*) as berjalan, 0 as pending, 0 as selesai,i_emp_req,i_emp_pm from DBADMIT.TMITPMPROJ WHERE C_ITPM_PROJSTAT = 'BERJALAN'
        group by i_emp_req,i_emp_pm
        union all
        
        select 0 as total, 0 as baru, 0 as berjalan, count(*) as pending, 0 as selesai,i_emp_req,i_emp_pm from DBADMIT.TMITPMPROJ WHERE C_ITPM_PROJSTAT = 'PENDING' 
        group by i_emp_req,i_emp_pm
        union all
        
        select 0 as total, 0 as baru, 0 as berjalan, 0 as pending, count(*) as selesai,i_emp_req,i_emp_pm from DBADMIT.TMITPMPROJ WHERE C_ITPM_PROJSTAT = 'SELESAI' 
        group by i_emp_req,i_emp_pm
        )`


        console.dir("sum")

    const res = await database.exec(query)
    return res.rows
    }
module.exports.summary = summary
module.exports.listProyek = listProyek
module.exports.stepper = stepper
module.exports.projectById = projectById
module.exports.realisasi = realisasi