const database = require('../conf/db/db')
const oracledb = require('oracledb');


async function find(params){

    let query=`select i_idproker as "id",
                d_proker as tahunproker,
                c_proker as kodeproker,
                e_proker as ketproker,
                i_idmpti as idmpti
                from dbadmit.tritpmproker `

                if(params){
                    query+=`where a.i_Idproker = :idproker`
                }
                query+=`\n order by 1 desc`
                const rest = await database.exec(query,params)
                return rest.rows
}

async function add(params){
    let query=`insert into dbadmit.tritpmproker
        (
            i_idmpti,
            d_proker,
            c_proker,
            e_proker,
            i_entry,
            d_entry
        )values(
            :IDMPTI,
            :TAHUNPROKER,
            :KODEPROKER,
            :KETPROKER,
            :IDENTRY,
            sysdate
        )returning i_idproker into :id `
        const param = {}
        param.IDMPTI = params.IDMPTI
        param.TAHUNPROKER = params.TAHUNPROKER
        param.KODEPROKER = params.KODEPROKER
        param.KETPROKER = params.KETPROKER
        param.IDENTRY = params.IDENTRY
    
        param.id = {dir:oracledb.BIND_OUT}
        
        const result = await database.exec(query,param)
        param.id = result.outBinds.id[0];
        return param
}

async function edit(params){
    let query=`update dbadmit.tritpmproker set
            d_proker = :TAHUNPROKER,
            c_proker = :KODEPROKER,
            e_proker = :KETPROKER,
            i_idmpti = :IDMPTI,
            i_update = :IDUPDATE,
            d_update = sysdate
            where i_Idproker = :id`

    const res = await database.exec(query,params)
    if(res.rowsAffected ==1){
        return params
    }else{
        return res
    }
}

async function remove(params){
    let query=`delete dbadmit.tritpmproker where i_Idproker = :idproker`

    const rest = await database.exec(query,params)
    return rest.rowsAffected
}

module.exports.find = find
module.exports.add = add
module.exports.edit = edit
module.exports.remove = remove