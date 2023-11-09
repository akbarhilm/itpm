const database = require('../conf/db/db')
const oracledb = require('oracledb');


async function find(params){

    let query=`select i_idproker as idporker,
                d_proker as tglproker,
                c_proker as kodeproker,
                e_proker as ketproker,
                decode(b.c_mpti||' / '||b.e_mpti,' / ','-',b.c_mpti||' / '||b.e_mpti) as mpti
                from dbadmit.tritpmproker a full join dbadmit.tritpmmpti b
                on a.i_idmpti = b.i_Idmpti`

                if(params){
                    query+=`where a.i_Idproker = :idproker`
                }

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
            :idmpti,
            :tglproker,
            :kodeproker,
            :ketproker,
            :identry,
            sysdate
        )returning i_idproker into :idproker `

        params.idproker = {dir:oracledb.BIND_OUT}
        
        const result = await database.exec(query,params)
        params.idproker = result.outBinds.idproker[0];
        return params
}

async function edit(params){
    let query=`update dbadmit.tritpmproker set
            d_proker = :tglproker,
            c_proker = :kodeproker,
            e_proker = :ketproker,
            i_idmpti = :idmpti,
            i_update = :idupdate,
            d_update = sysdate
            where i_Idproker = :idproker`

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