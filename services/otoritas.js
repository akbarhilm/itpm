const database = require('../conf/db/db')

async function find(params){
let query = `select i_itpm_auth as idauth, c_itpm_auth as kodeauth, n_itpm_auth as namaauth,
e_itpm_auth as ketauth, c_itpm_actv as kodeaktif from dbadmit.tritpmauth`
const param = {}
    if(params){
        
        param.i_itpm_auth = params.id
        query+=`\n where i_itpm_auth = :i_itpm_auth`
    }
    const result = await database.exec(query,param)
    return result.rows;
}


async function save(params){

    params.act = 1
    params.ientry=1
    params.dentry = new Date()
   
   let query = `insert into tritpmauth ( I_ITPM_AUTH,C_ITPM_AUTH,N_ITPM_AUTH,
    E_ITPM_AUTH,C_ITPM_ACTV,I_ENTRY,D_ENTRY)
    values (:id,:kodeauth,:namaauth,:keterangan,:act,:ientry,:dentry)`

   const result = await database.exec(query,params,{autoCommit:true})
   return result.rowsAffected;
}

async function edit(params){

    params.act = '1'
    params.ibah = '1'
    params.dbah = new Date()
   
   let query = `update tritpmauth
   set 
   C_ITPM_AUTH = :kodeauth,
   N_ITPM_AUTH = :namaauth,
   E_ITPM_AUTH = :keterangan,
   C_ITPM_ACTV = :act,
   I_UPDATE = :ibah,
   D_UPDATE = :dbah 
   where I_ITPM_AUTH = :id`

   const result = await database.exec(query,params,{autoCommit:true})
   return result.rowsAffected;
}

async function del(params){
   

    let query = `delete tritpmauth
    where I_ITPM_AUTH = :id`
 
    const result = await database.exec(query,params)
    return result.rowsAffected;
 }
 
 module.exports.del = del
 module.exports.edit = edit
 module.exports.find = find
 module.exports.save = save