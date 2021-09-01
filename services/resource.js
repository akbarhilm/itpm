const database = require("../conf/db/db");
const oracledb = require("oracledb");


async function find(params){
    let query=`select i_itpm_othrresrc as idresource, i_itpm_proj as idproj,
    n_itpm_othrresrc as namaresource, c_itpm_uom as kodeuom,
     q_itpm_resrc as quantity from DBADMIT.TMITPMOTHRRESRC`
     const param = {};
    if (Object.keys(params).some(function (k) { return params[k]; })) {
        // console.dir(!!params)
        query += `\n where`;
        if (Object.keys(params).find((x) => x == "idproj")) {
            query += `\n I_ITPM_PROJ = :idproj`;
            param.idproj = params.idproj;
        }

        if (Object.keys(params).find((x) => x == "namaresource")) {
            query += `\n lower(n_itpm_othrresrc) like '%'||lower(:namaresource)||'%'`;
            param.namaresource = params.namaresource;
        }
    }

    const result = await database.exec(query, param);
    return result.rows;
}

async function add(params){
    let query=`insert into DBADMIT.TMITPMOTHRRESRC(
        i_itpm_proj,
    n_itpm_othrresrc, 
    c_itpm_uom,
     q_itpm_resrc,
     i_entry,
     d_entry
    )values(
        :idproj,
        :namaresource,
        :kodeuom,
        :quantity,
        :identry,
        sysdate
    )`
        const param = {}
        param.idproj = params.idproj
        param.namaresource = params.namaresource
        param.kodeuom = params.kodeuom
        param.quantity = params.quantity
        param.identry = params.identry

    const result = await database.exec(query, param);
    return result.rows;
}

async function delres(params,commit,conn){
    let query=`delete DBADMIT.TMITPMOTHRRESRC where i_itpm_proj = :idproj`

    const param ={}
    param.idproj = params.idproj
    const result = await database.seqexec(query,param,commit,conn)
    return result.rows;
}

module.exports.find= find
module.exports.add = add
module.exports.delres = delres