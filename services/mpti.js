const database = require('../conf/db/db')
const oracledb = require('oracledb');

async function find(params){

    let query=`select i_idmpti as idmpti,
                d_mpti_start as tglmulai,
                d_mpti_compl as tglselesai,
                c_mpti as kodempti,
                e_mpti as ketmpti
                from dbadmit.tritpmmpti
                `
        const param ={}
        
            if (params) {
                
                 query += `\n where i_idmpti = :idmpti`;
                param.idmpti = params.idmpti
             }
        
  
    const res = await database.exec(query,params)
    return res.rows;
}

async function add(params){
    let query=`insert into dbadmit.tritpmmpti
    (
    d_mpti_start,
    d_mpti_compl,
    c_mpti,
    e_mpti,
    i_entry,
    d_entry
    )values(
    :tglmulai,
    :tglselesai,
    :kodempti,
    :ketmpti,
    :identry,
    sysdate
    )returning i_idmpti into :idmpti`
    
    params.idmpti = {dir:oracledb.BIND_OUT}
        
    const result = await database.exec(query,params)
    params.idmpti = result.outBinds.idmpti[0];
    return params
}

async function edit(params){
    let query=`update dbadmit.tritpmmpti set
    d_mpti_start = :tglmulai,
    d_mpti_compl = :tglselesai,
    c_mpti = :kodempti,
    e_mpti = :ketmpti,
    i_update = :idupdate,
    d_update = sysdate
    where i_idmpti = :idmpti `

    const res = await database.exec(query,params)
    if(res.rowsAffected ==1){
        return params
    }else{
    return res
    }
}

async function remove(params){
    let query=`delete dbadmit.tritpmmpti where i_idmpti = :idmpti`

    const res = await database.exec(query,params)
    
    return res.rowsAffected
    
}

module.exports.find = find
module.exports.add = add
module.exports.edit = edit
module.exports.remove = remove