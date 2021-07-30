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

async function findPenggunaProyek(params){
    const otor = await findPenggunaOtoritas(params);
    let query =`select I_ITPM_PROJ as idproyek,
    N_ITPM_PROJ as namaproyek,
    E_ITPM_PROJ as ketproyek,
    C_ITPM_ACTV as kodeaktif,
    N_ITPM_PROJURI as namauri,
    C_ITPM_PROJSTAT as statusproyek

    from dbadmit.tmitpmproj`;
    const param ={}
    if(!otor.find(x=>x.KODEAUTH=='PMO')){
    param.nik = params.nik

    query+=`\n  where :nik in (i_emp_req,i_emp_pm)`;
    }
    let result = await database.exec(query,param)
    let list = {"list":result.rows}
    
    if(otor.find(x=>x.KODEAUTH=='PMO')){
        const status = {"PMO":true};
       list.otoritas = status
    return list
    }else{
        const status = {"PMO":false};
        list.otoritas = status
        return list
    }
    
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

// module.exports.save = save