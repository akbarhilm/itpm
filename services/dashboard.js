const database = require('../conf/db/db')
const oracledb = require('oracledb');




async function listProyek(params) {
    let query = `
	select "id","no_layanan","nama_proyek","keterangan",case "status" when 'BERJALAN' THEN (case when max_tgl <= trunc(sysdate) then 'DELAYED' else 'ONGOING' end) else "status" end as "status","tanggal_mulai","tanggal_selesai","mpti","ref_mpti","proker","ref_proker"
    from(
    select "id","no_layanan","nama_proyek","keterangan",
    case "status" when 'SELESAI' THEN 'CLOSED' 
                  when 'BARU' then 'NEW'
                  ELSE "status" end as "status",
    "tanggal_mulai","tanggal_selesai", max(max_tgl) as max_tgl,"mpti","ref_mpti","proker","ref_proker"
        from(
        select a.I_ITPM_PROJ as "id",
    b.I_ITPM_SCNBR as "no_layanan",
    N_ITPM_PROJ as "nama_proyek",
    E_ITPM_PROJ as "keterangan",
   case C_ITPM_PROJSTAT when 'BERJALAN' THEN (case when c_itpm_useraprv = '1' then 'TOBE_LAUNCH' ELSE C_ITPM_PROJSTAT END) else C_ITPM_PROJSTAT  end as "status",
    p.d_itpm_actyfinish as max_tgl,
    to_char(z.D_ITPM_CHARTERSTART,'dd/mm/yyyy') as "tanggal_mulai",
    to_char(z.D_ITPM_CHARTERFINISH,'dd/mm/yyyy') as "tanggal_selesai",
    a.c_mpti as "mpti",
    a.n_ref_mpti as "ref_mpti",
    a.c_proker as "proker",
    a.n_ref_proker as "ref_proker"

    
    from DBADMIT.TMITPMPROJ a full join  dbadmit.tmitpmcharter z on  a.i_itpm_proj= z.i_itpm_proj
                              full join dbadmit.tmitpmplanreal p on a.I_itpm_proj = p.I_itpm_proj and p.c_Itpm_planreal = 'PLAN'
                               full join DBADMIT.TMITPMUAT c on a.i_Itpm_proj = c.I_itpm_proj
                              , DBADMIT.TMITPMSC b
    where a.i_itpm_sc = b.i_Itpm_sc 
    
    and to_char(a.d_entry,'yyyy')=:tahun
    
    )
    group by "id","no_layanan","nama_proyek","keterangan","status","tanggal_mulai","tanggal_selesai","mpti","ref_mpti","proker","ref_proker"
    )`
    const param = {}
    param.tahun = params.tahun
    const result = await database.exec(query, param)
    //console.dir(result)
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

async function progressById(params){
    let query=`select i_itpm_acty as idkegiatan, n_itpm_acty as namakegiatan , sum(progress) as progress from (
        select i_itpm_acty , n_itpm_acty , 0 as progress from dbadmit.tritpmacty
        union all
        select a.i_itpm_acty, b.n_itpm_acty, to_number(a.v_itpm_progress) as progress from dbadmit.tmitpmplanreal a,  dbadmit.tritpmacty b where a.i_itpm_proj = :idproj
        and a.I_itpm_acty = b.i_itpm_acty and a.c_itpm_planreal = 'REALISASI')
        group by i_itpm_acty, n_itpm_acty
        order by 1`

    const param = {}
    param.idproj = params.idproj
    const result = await database.exec(query,param)

    return result.rows
}


async function projectById(params) {
    let query = `select "id","no_layanan","type_layanan",
    "jenis_app",
    "nama_modul","nama_proyek","keterangan",case "status" when 'BERJALAN' THEN (case when max_tgl <= trunc(sysdate) then 'DELAYED' else 'ONGOING' end) else "status" end as "status", "bisnis_owner","project_mgr","tanggal_mulai","tanggal_selesai","mpti","ref_mpti","proker","ref_proker"
    from(
    select "id","no_layanan", "type_layanan",
    "jenis_app",
    "nama_modul",
    "nama_proyek","keterangan",
    case "status" when 'SELESAI' THEN 'CLOSED' 
                  when 'BARU' then 'NEW'
                  ELSE "status" end as "status",
    "tanggal_mulai","tanggal_selesai", max(max_tgl) as max_tgl,"bisnis_owner","project_mgr","mpti","ref_mpti","proker","ref_proker"
        FROM(
select a.I_ITPM_PROJ as "id",
    b.I_ITPM_SCNBR as "no_layanan",
    a.C_ITPM_SC as "type_layanan",
    C_ITPM_APPLSTAT as "jenis_app",
    d.N_ITPM_MDL as "nama_modul",
    N_ITPM_PROJ as "nama_proyek",
    E_ITPM_PROJ as "keterangan",
    case C_ITPM_PROJSTAT when 'BERJALAN' THEN (case when c_itpm_useraprv = '1' then 'TOBE_LAUNCH' ELSE C_ITPM_PROJSTAT END) else C_ITPM_PROJSTAT  end as "status",
    p.d_itpm_actyfinish as max_tgl,
    a.I_EMP_REQ as "bisnis_owner",
    a.I_EMP_PM as "project_mgr",
    to_char(c.D_ITPM_CHARTERSTART,'dd/mm/yyyy') as "tanggal_mulai",
    to_char(c.D_ITPM_CHARTERFINISH,'dd/mm/yyyy') as "tanggal_selesai",
    a.c_mpti as "mpti",
    a.n_ref_mpti as "ref_mpti",
    a.c_proker as "proker",
    a.n_ref_proker as "ref_proker"
    
    from DBADMIT.TMITPMPROJ a full join DBADMIT.TMITPMCHARTER c on a.i_itpm_proj = c.i_itpm_proj
                                full join dbadmit.tmitpmuat z on a.I_itpm_proj = z.i_itpm_proj
                                full join dbadmit.tmitpmplanreal p on a.I_itpm_proj = p.I_itpm_proj and p.c_Itpm_planreal = 'PLAN'
    , DBADMIT.TMITPMSC b, dbadmit.tritpmmdl d
    where a.i_itpm_sc = b.i_Itpm_sc and   a.i_Itpm_mdl = d.i_itpm_mdl
    and a.I_itpm_proj = :id
    )
    group by "id","no_layanan","type_layanan",
    "jenis_app",
    "nama_modul","nama_proyek","keterangan","status","bisnis_owner","project_mgr","tanggal_mulai","tanggal_selesai","mpti","ref_mpti","proker","ref_proker"
    )
	`
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


    let query = `SELECT SUM(total) as "total",sum(baru) as "new" , sum(berjalan) as "on_going", sum(tbl) as "tobe_launch", sum(delay) as "delay",sum(pending) as "pending", sum(cancl) as "cancel",sum(hold) as "hold", sum(blocked) as "blocked", sum(selesai) as "closed" from (
        select count(*) as total,0 as baru, 0 as berjalan, 0 as tbl, 0 as delay, 0 as pending, 0 as cancl, 0 as hold, 0 as blocked, 0 as selesai
       from DBADMIT.TMITPMPROJ  where  to_char(d_entry,'yyyy') = :tahun
       
       union all
   
       select 0 as total, count(*) as baru, 0 as berjalan, 0 as tbl, 0 as delay, 0 as pending,0 as cancl, 0 as hold, 0 as blocked, 0 as selesai
       from DBADMIT.TMITPMPROJ WHERE C_ITPM_PROJSTAT = 'BARU'  and to_char(d_entry,'yyyy') = :tahun
     
       union all
       
       select 0 as total, 0 as baru, count(*) as berjalan, 0 as tbl, 0 as delay,0 as pending,0 as cancl, 0 as hold, 0 as blocked, 0 as selesai
       from DBADMIT.TMITPMPROJ WHERE C_ITPM_PROJSTAT = 'BERJALAN' and i_itpm_proj not in (select  case when max(d_itpm_actyfinish)<= trunc(sysdate) then i_itpm_proj else 0 end as i_itpm_proj from  dbadmit.tmitpmplanreal where C_ITPM_PLANREAL = 'PLAN' group by I_itpm_proj  )
      and  to_char(d_entry,'yyyy') = :tahun
       union all
       
          select 0 as total, 0 as baru, 0 as berjalan, count(*) as tbl,0 as delay,0 as pending,0 as cancl, 0 as hold, 0 as blocked, 0 as selesai
       from DBADMIT.TMITPMPROJ a, DBADMIT.TMITPMUAT b WHERE C_ITPM_PROJSTAT = 'BERJALAN' and a.i_itpm_proj not in (select  case when max(d_itpm_actyfinish)<= trunc(sysdate) then i_itpm_proj else 0 end as i_itpm_proj from  dbadmit.tmitpmplanreal where C_ITPM_PLANREAL = 'PLAN' group by I_itpm_proj  )
      and  a.i_itpm_proj = b.i_itpm_proj and b.c_itpm_useraprv = 1 and to_char(a.d_entry,'yyyy') = :tahun
       union all
       
        select 0 as total, 0 as baru, 0 as berjalan, 0 as tbl, count(*)  as delay,0 as pending,0 as cancl, 0 as hold, 0 as blocked, 0 as selesai
       from DBADMIT.TMITPMPROJ WHERE C_ITPM_PROJSTAT = 'BERJALAN' and i_itpm_proj in (select  case when max(d_itpm_actyfinish)<= trunc(sysdate) then i_itpm_proj else 0 end as i_itpm_proj from  dbadmit.tmitpmplanreal where C_ITPM_PLANREAL = 'PLAN' group by I_itpm_proj  )
    and to_char(d_entry,'yyyy') = :tahun
       union all
       
       select 0 as total, 0 as baru, 0 as berjalan, 0 as tbl, 0 as delay, count(*) as pending,0 as cancl, 0 as hold, 0 as blocked, 0 as selesai
       from DBADMIT.TMITPMPROJ WHERE C_ITPM_PROJSTAT = 'PENDING' 
       and to_char(d_entry,'yyyy') = :tahun
       union all
   
       select 0 as total, 0 as baru, 0 as berjalan, 0 as tbl, 0 as delay, 0 as pending,count(*) as cancl, 0 as hold, 0 as blocked, 0 as selesai
       from DBADMIT.TMITPMPROJ WHERE C_ITPM_PROJSTAT = 'CANCEL' 
       and to_char(d_entry,'yyyy') = :tahun
       union all
   
       select 0 as total, 0 as baru, 0 as berjalan, 0 as tbl, 0 as delay, 0 as pending,0 as cancl, count(*) as hold, 0 as blocked,0 as selesai
       from DBADMIT.TMITPMPROJ WHERE C_ITPM_PROJSTAT = 'HOLD' 
       and to_char(d_entry,'yyyy') = :tahun
       union all
   
       select 0 as total, 0 as baru, 0 as berjalan, 0 as tbl, 0 as delay, 0 as pending,0 as cancl, 0 as hold, count(*) as blocked,0 as selesai
       from DBADMIT.TMITPMPROJ WHERE C_ITPM_PROJSTAT = 'BLOCKED' 
       and to_char(d_entry,'yyyy') = :tahun

       union all
       select 0 as total, 0 as baru, 0 as berjalan, 0 as tbl, 0 as delay, 0 as pending,0 as cancl, 0 as hold, 0 as blocked, count(*) as selesai
       from DBADMIT.TMITPMPROJ WHERE C_ITPM_PROJSTAT = 'SELESAI' 
       and to_char(d_entry,'yyyy') = :tahun
       )
    
       `


    const param = {}
    param.tahun = params.tahun

    const res = await database.exec(query, param)
    return res.rows
}


async function reportproject(){
    let query=`select 
    a.I_ITPM_PROJ as "id",
    b.I_ITPM_SCNBR as "no_layanan",
    N_ITPM_PROJ as "nama_aplikasi",
    C_ITPM_APPLSTAT as "jenis_app",
    a.C_ITPM_SC as "jenis_layanan",
    a.I_EMP_REQ as "nik_BPO",
    a.I_EMP_PM as "nik_PM"
   

    from DBADMIT.TMITPMPROJ a, DBADMIT.TMITPMSC b where a.I_itpm_sc = b.I_itpm_sc` 
    //and :idproj like '%,'||a.I_ITPM_PROJ||',%'`
    // const param = {}
    // param.idproj = params.idproj

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

async function getProker(params){
    let query=`select 'PROKER' as proker, (select count(*) from dbadmit.tmitpmproj WHERE c_mpti = 1 and c_proker = 1 and to_char(d_entry,'yyyy') = :tahun ) as mpti, (select COUNT(*) from dbadmit.tmitpmproj WHERE c_mpti = 0 and c_proker = 1 and to_char(d_entry,'yyyy') = :tahun) as non_mpti from dual
    union ALL
    select 'NON PROKER' as NON_proker, (select COUNT(*) from dbadmit.tmitpmproj WHERE c_mpti = 1 and c_proker = 0 and  to_char(d_entry,'yyyy') = :tahun) as mpti, (select COUNT(*) from dbadmit.tmitpmproj WHERE c_mpti = 0 and c_proker = 0 and to_char(d_entry,'yyyy') = :tahun) as non_mpti from dual
`

    const param = {}
    param.tahun = params.tahun
    const rest = await database.exec(query,param)

    return rest.rows
}

module.exports.progressById = progressById
module.exports.getProker = getProker
module.exports.reportproject = reportproject
module.exports.reportrealisasi = reportrealisasi
module.exports.reportrencana = reportrencana
module.exports.summary = summary
module.exports.listProyek = listProyek
module.exports.stepper = stepper
module.exports.projectById = projectById
module.exports.realisasi = realisasi