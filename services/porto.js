const database = require('../conf/db/db')
const oracledb = require('oracledb');

async function find(params){
    let query=`select i_Idporto as idporto,
            c_bus_type as kodebisnis,
            n_appl as namaaplikasi,
            n_modul as namamodul,
            e_appl as ketaplikasi,
            c_status as kodestatus,
            n_url as namaurl
            from dbadmit.tritpmporto`
    if(params){
        query+=`where i_Idporto = :idporto`
    }

    const rest = await database.exec(query,params)
    return rest.rows
}

async function add(params){

    let query=`insert into dbadmit.tritpmporto
    (
        c_bus_type,
        n_appl,
        n_modul,
        e_appl,
        c_status,
        n_url,
        I_entry,
        d_entry
    )values(
        :kodebisnis,
        :namaaplikasi,
        :namamodul,
        :ketaplikasi,
        :kodestatus,
        :namaurl,
        :identry,
        sysdate
    )returning i_Idporto into :idporto`

    params.idporto = {dir:oracledb.BIND_OUT}
        
    const result = await database.exec(query,params)
    params.idporto = result.outBinds.idporto[0];
    return params
}

async function edit(params){

    let query=`update dbadmit.tritpmporto set
        c_bus_type = :kodebisnis,
        n_appl = :namaaplikasi,
        n_modul = :namamodul,
        e_appl = :ketaplikasi,
        c_status = :kodestatus,
        n_url = :namaurl,
        i_update = :idupdate,
        d_update = sysdate
        where i_idporto = :idporto
    `
    const res = await database.exec(query,params)
    if(res.rowsAffected ==1){
        return params
    }else{
    return res
    }
}

async function remove(params){

    let query=`delete dbadmit.tritpmporto where i_idporto = :idporto`
    const res = await database.exec(query,params)
    
    return res.rowsAffected
}

module.exports.find = find
module.exports.add = add
module.exports.edit = edit
module.exports.remove = remove