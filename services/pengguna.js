const database = require('../conf/db/db')

async function find(params){
    let query = `select i_emp as nik,i_emp_email as email,c_itpm_actv as kodeaktif`;
    const param = {}
   
    if(params){
        param.nama = params.nama
        param.nik = params.nik
       
        query+=`\n,:nama as nama from dbadmit.tritpmuser where i_emp = :nik`
    }else{
        query+=`\n from dbadmit.tritpmuser`
    }
    const result = await database.exec(query,param)
    return result.rows;
}

async function useremail(params){
    let query=`select i_emp_email as email from dbadmit.tritpmuser where i_emp = :nik `
    const result = await database.exec(query,params)
    return result.rows;
}

async function summaryProyek(params){
    const paramotor = {}
    paramotor.nik = params.nik
    const otor = await findPenggunaOtoritas(paramotor);
    
    let query=`SELECT SUM(total) as total,sum(baru) as baru , sum(berjalan) as berjalan, sum(delay) as delay,sum(pending) as pending, sum(cancl) as cancel,sum(hold) as hold, sum(blocked) as blocked, sum(selesai) as selesai from (
        select count(*) as total,0 as baru, 0 as berjalan,0 as delay, 0 as pending, 0 as cancl, 0 as hold, 0 as blocked, 0 as selesai, i_emp_pm,i_emp_req
       from DBADMIT.TMITPMPROJ  where  substr(to_char(d_entry,'dd-mm-yyyy'),7) = :tahun
       group by i_emp_pm,i_emp_req
       
       union all
   
       select 0 as total, count(*) as baru, 0 as berjalan,0 as delay, 0 as pending,0 as cancl, 0 as hold, 0 as blocked, 0 as selesai, i_emp_pm,i_emp_req
       from DBADMIT.TMITPMPROJ WHERE C_ITPM_PROJSTAT = 'BARU'  and substr(to_char(d_entry,'dd-mm-yyyy'),7) = :tahun
       group by i_emp_pm,i_emp_req
       
       union all
       
       select 0 as total, 0 as baru, count(*) as berjalan,0 as delay,0 as pending,0 as cancl, 0 as hold, 0 as blocked, 0 as selesai, i_emp_pm,i_emp_req
       from DBADMIT.TMITPMPROJ WHERE C_ITPM_PROJSTAT = 'BERJALAN' and i_itpm_proj not in (select  case when max(d_itpm_actyfinish)<= trunc(sysdate) then i_itpm_proj else 0 end as i_itpm_proj from  dbadmit.tmitpmplanreal where C_ITPM_PLANREAL = 'PLAN' group by I_itpm_proj  )
      and  substr(to_char(d_entry,'dd-mm-yyyy'),7) = :tahun
      group by i_emp_pm,i_emp_req
       
       union all
       
        select 0 as total, 0 as baru, 0 as berjalan,count(*)  as delay,0 as pending,0 as cancl, 0 as hold, 0 as blocked, 0 as selesai, i_emp_pm,i_emp_req
       from DBADMIT.TMITPMPROJ WHERE C_ITPM_PROJSTAT = 'BERJALAN' and i_itpm_proj in (select  case when max(d_itpm_actyfinish)<= trunc(sysdate) then i_itpm_proj else 0 end as i_itpm_proj from  dbadmit.tmitpmplanreal where C_ITPM_PLANREAL = 'PLAN' group by I_itpm_proj  )
    and substr(to_char(d_entry,'dd-mm-yyyy'),7) = :tahun
    group by i_emp_pm,i_emp_req
       
       union all
       
       select 0 as total, 0 as baru, 0 as berjalan,0 as delay, count(*) as pending,0 as cancl, 0 as hold, 0 as blocked, 0 as selesai, i_emp_pm,i_emp_req
       from DBADMIT.TMITPMPROJ WHERE C_ITPM_PROJSTAT = 'PENDING' 
       and substr(to_char(d_entry,'dd-mm-yyyy'),7) = :tahun
       group by i_emp_pm,i_emp_req
       
       union all
   
       select 0 as total, 0 as baru, 0 as berjalan,0 as delay, 0 as pending,count(*) as cancl, 0 as hold, 0 as blocked, 0 as selesai, i_emp_pm,i_emp_req
       from DBADMIT.TMITPMPROJ WHERE C_ITPM_PROJSTAT = 'CANCEL' 
       and substr(to_char(d_entry,'dd-mm-yyyy'),7) = :tahun
       group by i_emp_pm,i_emp_req
       
       union all
   
       select 0 as total, 0 as baru, 0 as berjalan,0 as delay, 0 as pending,0 as cancl, count(*) as hold, 0 as blocked,0 as selesai, i_emp_pm,i_emp_req
       from DBADMIT.TMITPMPROJ WHERE C_ITPM_PROJSTAT = 'HOLD' 
       and substr(to_char(d_entry,'dd-mm-yyyy'),7) = :tahun
       group by i_emp_pm,i_emp_req
       
       union all
   
       select 0 as total, 0 as baru, 0 as berjalan,0 as delay, 0 as pending,0 as cancl, 0 as hold, count(*) as blocked,0 as selesai, i_emp_pm,i_emp_req
       from DBADMIT.TMITPMPROJ WHERE C_ITPM_PROJSTAT = 'BLOCKED' 
       and substr(to_char(d_entry,'dd-mm-yyyy'),7) = :tahun
       group by i_emp_pm,i_emp_req

       union all
       select 0 as total, 0 as baru, 0 as berjalan,0 as delay, 0 as pending,0 as cancl, 0 as hold, 0 as blocked, count(*) as selesai, i_emp_pm,i_emp_req
       from DBADMIT.TMITPMPROJ WHERE C_ITPM_PROJSTAT = 'SELESAI' 
       and substr(to_char(d_entry,'dd-mm-yyyy'),7) = :tahun
       group by i_emp_pm,i_emp_req
       
       )`

    console.dir(otor)
    const paramq = {}

    const mapotor = otor.map(x=>x.KODEAUTH)
    const checkotor = ["PMO","QA","BOD"]
    if(!checkotor.some(val => mapotor.includes(val))){
        paramq.nik = params.nik
        
        query+=`where :nik in (i_emp_req,i_emp_pm)`;
        }
    

        paramq.tahun = params.tahun
    const res = await database.exec(query,paramq)
    return res.rows
}

async function findPenggunaProyek(params){
    const paramotor = {}
    paramotor.nik = params.nik
    const otor = await findPenggunaOtoritas(paramotor);
    let query =`select a.I_ITPM_PROJ as idproyek,
    a.C_ITPM_APPLSTAT as jenisproj,
    b.I_ITPM_SCNBR as nolayanan,
    b.N_PRIORITY_LVL as prioritas,
    a.N_ITPM_PROJ as namaproyek,
    a.E_ITPM_PROJ as ketproyek,
    a.C_ITPM_ACTV as kodeaktif,
    a.N_ITPM_PROJURI as namauri,
    a.C_ITPM_PROJSTAT as statusproyek,
    a.e_itpm_projstatchng as ketstatus,
    a.C_ITPM_SC as "jenis_layanan",
    a.I_EMP_REQ as "nik_BPO",
    a.I_EMP_PM as "nik_PM",
    to_char(a.d_entry,'dd/mm/yyyy') as tglentry
    
    from dbadmit.tmitpmproj a, DBADMIT.TMITPMSC b
    where a.I_ITPM_SC = b.I_ITPM_SC 
    `;
    
    const param ={}
    //param.status = params.status
    const mapotor = otor.map(x=>x.KODEAUTH)
    const checkotor = ["PMO","QA","BOD"]
    if(params.d){
        param.sap = params.sap
        param.non = params.non
        query+=`and a.C_ITPM_APPLSTAT in (:sap,:non)`
    }
  
    // if(otor.find(x=>x.KODEAUTH=="BPO") || otor.find(x=>x.KODEAUTH=="PM")){
    if(!checkotor.some(val => mapotor.includes(val))){
    param.nik = params.nik

    query+=` and :nik in (a.i_emp_req,a.i_emp_pm)`;
    }
    //console.dir(params.status)
    if(params.status !== 'ALL' ){
        if(params.status === 'BERJALAN'){
           
            query+=`and a.i_itpm_proj not in (select  case when max(d_itpm_actyfinish)<= trunc(sysdate) then i_itpm_proj else 0 end as i_itpm_proj from  dbadmit.tmitpmplanreal where C_ITPM_PLANREAL = 'PLAN' group by I_itpm_proj  )`
        }
        if(params.status === 'DELAY'){
            params.status = 'BERJALAN'
            query+=`and a.i_itpm_proj in (select  case when max(d_itpm_actyfinish)<= trunc(sysdate) then i_itpm_proj else 0 end as i_itpm_proj from  dbadmit.tmitpmplanreal where C_ITPM_PLANREAL = 'PLAN' group by I_itpm_proj  )`
        }
        
         
      param.status = params.status
    query += ` and  a.C_ITPM_PROJSTAT = :status`;
    }
    query+=` order by a.d_entry desc`;

    console.dir(query)
    console.dir(param)
    console.dir(param.status)

    let result = await database.exec(query,param)
    let list = {"list":result.rows}
    
  



    const checks = checkotor.reduce((obj, val) => ({[val]: mapotor.includes(val), ...obj}), {})
    
    
        list.otoritas = checks

        return list
    
    
}


async function findPenggunaOtoritas(params){
    let query =`select i_itpm_auth as idauth,c_itpm_auth as kodeauth,n_itpm_auth as namaauth from dbadmit.tritpmauth where i_itpm_auth in (
        select distinct i_itpm_auth from DBADMIT.tritpmmenuauth where i_itpm_menuauth in (
        select i_itpm_menuauth from dbadmit.tritpmuserauth where i_emp = :nik))`;
    const param ={}
    param.nik = params.nik
    const result = await database.exec(query,param)
    return result.rows
}



// async function save(params){

//      params.act = 1
//      params.ientry=1
//      params.dentry = new Date()
    
//     let query = `insert into tritpmmenu ( I_ITPM_MENU, I_ITPM_MENUPRNT, N_ITPM_MENU,N_ITPM_MENUURI,
//         E_ITPM_MENU,C_ITPM_MENUSDBAR,I_ITPM_MENUSORT,
//         C_ITPM_ACTV,I_ENTRY,D_ENTRY)
//         values (:id,:menuprint,:namamenu,:namauri,:keterangan,:sidebar,:idsort,:act,:ientry,:dentry)`

//     const result = await database.exec(query,params)
//     return result.rowsAffected;
// }

// async function edit(params){

//      params.act = '1'
//      params.ibah = '1'
//      params.dbah = new Date()
    
//     let query = `update tritpmmenu
//     set 
//     I_ITPM_MENUPRNT = :menuprint,
//     N_ITPM_MENU = :namamenu,
//     N_ITPM_MENUURI = :namauri,
//     E_ITPM_MENU = :keterangan,
//     C_ITPM_MENUSDBAR = :sidebar,
//     I_ITPM_MENUSORT=:idsort,
//     C_ITPM_ACTV = :act,
//     I_UPDATE = :ibah,
//     D_UPDATE = :dbah 
//     where I_ITPM_MENU = :id`

//     const result = await database.exec(query,params)
//     return result.rowsAffected;
// }

// async function del(params){
   

//    let query = `delete tritpmmenu
//    where I_ITPM_MENU = :id`

//    const result = await database.exec(query,params)
//    return result.rowsAffected;
// }

// module.exports.del = del
// module.exports.edit = edit
module.exports.find = find
module.exports.findPenggunaProyek = findPenggunaProyek
module.exports.findPenggunaOtoritas = findPenggunaOtoritas
module.exports.useremail = useremail
module.exports.summaryProyek = summaryProyek

// module.exports.save = save