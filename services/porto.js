const database = require('../conf/db/db')
const oracledb = require('oracledb');

async function find(params){
    let query=`select i_Idporto as "id",
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
    query+=`\n order by 1 desc`
   
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
        :KODEBISNIS,
        :NAMAAPLIKASI,
        :NAMAMODUL,
        :KETAPLIKASI,
        :KODESTATUS,
        :NAMAURL,
        :identry,
        sysdate
    )returning i_Idporto into :id`
    
    const param = {}
    param.KODEBISNIS = params.KODEBISNIS
    param.NAMAAPLIKASI = params.NAMAAPLIKASI
    param.NAMAMODUL = params.NAMAMODUL
    param.KETAPLIKASI = params.KETAPLIKASI
    param.KODESTATUS = params.KODESTATUS
    param.NAMAURL = params.NAMAURL
    param.identry = params.identry
    param.id = {dir:oracledb.BIND_OUT}
        
    const result = await database.exec(query,param)
    param.id = result.outBinds.id[0];
    delete param.identry
    return param
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
    const param = {}
    param.idporto = params.id
    param.kodebisnis = params.KODEBISNIS
    param.namaaplikasi = params.NAMAAPLIKASI
    param.namamodul = params.NAMAMODUL
    param.ketaplikasi = params.KETAPLIKASI
    param.kodestatus = params.KODESTATUS
    param.namaurl = params.NAMAURL
    param.idupdate = params.idupdate

    const res = await database.exec(query,param)
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