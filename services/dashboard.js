const database = require('../conf/db/db')
const oracledb = require('oracledb');




async function listProyek(params) {
    let query = `   select "id","no_layanan","nama_proyek","keterangan","status","tanggal_mulai","tanggal_selesai"
    from(
    select a.I_ITPM_PROJ as "id",
b.I_ITPM_SCNBR as "no_layanan",
N_ITPM_PROJ as "nama_proyek",
E_ITPM_PROJ as "keterangan",
C_ITPM_PROJSTAT as "status",
to_char(z.D_ITPM_CHARTERSTART,'dd/mm/yyyy') as "tanggal_mulai",
to_char(z.D_ITPM_CHARTERFINISH,'dd/mm/yyyy') as "tanggal_selesai"

from DBADMIT.TMITPMPROJ a full join  dbadmit.tmitpmcharter z on  a.i_itpm_proj= z.i_itpm_proj, DBADMIT.TMITPMSC b
where a.i_itpm_sc = b.i_Itpm_sc 
and substr(to_char(a.d_entry,'dd/mm/yyyy'),7)=:tahun
)`
    const param = {}
    param.tahun = params.tahun
    const result = await database.exec(query, param)
    console.dir(result)
    return result.rows
}


async function stepper(params) {

    let query = `SELECT a.I_ITPM_UREQNBR as "user_req",b.I_ITPM_CHARTERNBR as "charter",a.I_ITPM_PLANNBR as "plan", a.I_ITPM_RISKNBR as "risk",  a.I_ITPM_RESRCNBR as "resources",a.I_ITPM_REALNBR as "realisasi",a.I_ITPM_BANBR as "berita_acara",d.i_itpm_robonbr as "backout",c.i_itpm_uatnbr as "uat"
    from dbadmit.tmitpmproj a
    full outer join DBADMIT.TMITPMCHARTER b on a.i_itpm_proj = b.i_itpm_proj
    full outer join DBADMIT.TMITPMUAT c on c.i_itpm_proj = b.i_itpm_proj
    full outer join DBADMIT.TMITPMROBO d on d.i_itpm_proj = b.i_itpm_proj
    where to_char(a.i_itpm_proj) = :id`

    const result = await database.exec(query, params)
    return result.rows
}


async function projectById(params) {
    let query = `select a.I_ITPM_PROJ as "id",
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
    const result = await database.exec(query, param)
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

async function summary(params) {


    let query = `SELECT SUM(total) as "proyek_total",sum(baru) as "proyek_baru" , sum(berjalan) as "proyek_berjalan", sum(pending) as "proyek_pending", sum(selesai) as "proyek_selesai",tahun from (
        select count(*) as total,0 as baru, 0 as berjalan, 0 as pending, 0 as selesai,substr(to_char(d_entry,'dd/mm/yyyy'),7) as tahun from DBADMIT.TMITPMPROJ
       group by d_entry
        union all
        
        select 0 as total, count(*) as baru, 0 as berjalan, 0 as pending, 0 as selesai,substr(to_char(d_entry,'dd/mm/yyyy'),7) as tahun from DBADMIT.TMITPMPROJ WHERE C_ITPM_PROJSTAT = 'BARU' 
        group by d_entry
        union all
        
        select 0 as total, 0 as baru, count(*) as berjalan, 0 as pending, 0 as selesai,substr(to_char(d_entry,'dd/mm/yyyy'),7) as tahun from DBADMIT.TMITPMPROJ WHERE C_ITPM_PROJSTAT = 'BERJALAN'
        group by d_entry
        union all
        
        select 0 as total, 0 as baru, 0 as berjalan, count(*) as pending, 0 as selesai,substr(to_char(d_entry,'dd/mm/yyyy'),7) as tahun from DBADMIT.TMITPMPROJ WHERE C_ITPM_PROJSTAT = 'PENDING' 
       group by d_entry
        union all
        
        select 0 as total, 0 as baru, 0 as berjalan, 0 as pending, count(*) as selesai,substr(to_char(d_entry,'dd/mm/yyyy'),7) as tahun from DBADMIT.TMITPMPROJ WHERE C_ITPM_PROJSTAT = 'SELESAI' 
       group by d_entry
        )
        where tahun = :tahun
        group by tahun
   
       `


    const param = {}
    param.tahun = params.tahun

    const res = await database.exec(query, param)
    return res.rows
}


async function reportproject(params){
    let query=`select 
    a.I_ITPM_PROJ as "id",
    b.I_ITPM_SCNBR as "no_layanan",
    N_ITPM_PROJ as "nama_aplikasi",
    C_ITPM_APPLSTAT as "jenis_app",
    a.C_ITPM_SC as "jenis_layanan",
    a.I_EMP_REQ as "nik_BPO",
    a.I_EMP_PM as "nik_PM"
   

    from DBADMIT.TMITPMPROJ a, DBADMIT.TMITPMSC b where a.I_itpm_sc = b.I_itpm_sc 
    and :idproj like '%,'||a.I_ITPM_PROJ||',%'`
    const param = {}
    param.idproj = params.idproj

    const result = await database.exec(query)
    return result.rows
}

async function reportrealisasi(params) {

    let query = `select
    b.n_itpm_acty as "kegiatan",  
    i_emp_actyassign as "pelaksana", 
    to_char(d_itpm_actystart,'dd/mm/yyyy') as "tanggal_mulai", 
    to_char(d_itpm_actyfinish,'dd/mm/yyyy') as "tanggal_selesai",
    b.N_ITPM_ACTYTARGET as "target" 
    from dbadmit.tmitpmplanreal a, dbadmit.tritpmacty b
    where c_itpm_planreal = 'REALISASI' and
    I_ITPM_PROJ = :idproj and A.I_ITPM_ACTY = B.I_ITPM_ACTY`;

    const param = {}
    param.idproj = params.id

    const result = await database.exec(query, param);
    return result.rows;
}
async function reportrencana(params) {

    let query = `select
    b.n_itpm_acty as "kegiatan",  
    i_emp_actyassign as "pelaksana", 
    to_char(d_itpm_actystart,'dd/mm/yyyy') as "tanggal_mulai", 
    to_char(d_itpm_actyfinish,'dd/mm/yyyy') as "tanggal_selesai",
    b.N_ITPM_ACTYTARGET as "target"
    from dbadmit.tmitpmplanreal a, dbadmit.tritpmacty b
    where c_itpm_planreal = 'PLAN' and
    I_ITPM_PROJ = :idproj and A.I_ITPM_ACTY = B.I_ITPM_ACTY`;

    const param = {}
    param.idproj = params.id

    const result = await database.exec(query, param);
    return result.rows;
}

module.exports.reportproject = reportproject
module.exports.reportrealisasi = reportrealisasi
module.exports.reportrencana = reportrencana
module.exports.summary = summary
module.exports.listProyek = listProyek
module.exports.stepper = stepper
module.exports.projectById = projectById
module.exports.realisasi = realisasi