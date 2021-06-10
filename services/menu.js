const database = require('../conf/db/db')
const pengguna = require('./pengguna')

async function find(params){
    let query = `select i_itpm_menu as idMenu,n_itpm_menu as namaMenu,n_itpm_menuuri as namaUri,e_itpm_menu as ketMenu,
    c_itpm_menusdbar as kodeSidebar,i_itpm_menusort as idSort from dbadmit.tritpmmenu`;
    const param = {}
    if(params){
        
        param.i_itpm_menu = params.id
        query+=`\n where i_itpm_menu = :i_itpm_menu`
    }
    const result = await database.exec(query,param)
    return result.rows;
}

async function findMenuProyekByPengguna(params){
    const otor = await pengguna.findPenggunaOtoritas(params);
    let query=""
    console.dir(otor)
    const param ={}
    if(!otor.find(x=>x.KODEAUTH=='PMO')){
        console.dir(params.nik)
        console.dir(params.id)
        param.nik = params.nik
    param.id = params.id
     query +=`select i_itpm_menu as idmenu,n_itpm_menu as namaMenu,n_itpm_menuuri as namaUri,e_itpm_menu as ketMenu,
     c_itpm_menusdbar as kodeSidebar,i_itpm_menusort as idSort
                from DBADMIT.TRITPMMENU where i_itpm_menu in (
                select i_itpm_menu from dbadmit.tritpmmenuauth a, dbadmit.tritpmauth b  where a.i_itpm_auth = b.i_itpm_auth and b.c_itpm_auth=(
                select  case when i_emp_req = :nik then 'BPO'
                    when i_emp_pm = :nik then 'PM'
                    end as role
                from DBADMIT.TMITPMPROJ where to_char(i_itpm_proj) = :id  or n_itpm_projuri = :id))`
                }
    else{
        console.dir("asd")
        query +=`select i_itpm_menu as idmenu,n_itpm_menu as namaMenu,n_itpm_menuuri as namaUri,e_itpm_menu as ketMenu,
        c_itpm_menusdbar as kodeSidebar,i_itpm_menusort as idSort
                from DBADMIT.TRITPMMENU where i_itpm_menu in (
                select i_itpm_menu from dbadmit.tritpmmenuauth a, dbadmit.tritpmauth b  where a.i_itpm_auth = b.i_itpm_auth and b.c_itpm_auth='PMO')`
                }
    
    const result = await database.exec(query,param)
    return result.rows

}

async function save(params){

     params.act = 1
     params.ientry=1
     params.dentry = new Date()
    
    let query = `insert into tritpmmenu ( I_ITPM_MENU, I_ITPM_MENUPRNT, N_ITPM_MENU,N_ITPM_MENUURI,
        E_ITPM_MENU,C_ITPM_MENUSDBAR,I_ITPM_MENUSORT,
        C_ITPM_ACTV,I_ENTRY,D_ENTRY)
        values (:id,:menuprint,:namamenu,:namauri,:keterangan,:sidebar,:idsort,:act,:ientry,:dentry)`

    const result = await database.exec(query,params)
    return result.rowsAffected;
}

async function edit(params){

     params.act = '1'
     params.ibah = '1'
     params.dbah = new Date()
    
    let query = `update tritpmmenu
    set 
    I_ITPM_MENUPRNT = :menuprint,
    N_ITPM_MENU = :namamenu,
    N_ITPM_MENUURI = :namauri,
    E_ITPM_MENU = :keterangan,
    C_ITPM_MENUSDBAR = :sidebar,
    I_ITPM_MENUSORT=:idsort,
    C_ITPM_ACTV = :act,
    I_UPDATE = :ibah,
    D_UPDATE = :dbah 
    where I_ITPM_MENU = :id`

    const result = await database.exec(query,params)
    return result.rowsAffected;
}

async function del(params){
   

   let query = `delete tritpmmenu
   where I_ITPM_MENU = :id`

   const result = await database.exec(query,params)
   return result.rowsAffected;
}

module.exports.del = del
module.exports.edit = edit
module.exports.find = find
module.exports.save = save
module.exports.findMenuProyekByPengguna = findMenuProyekByPengguna