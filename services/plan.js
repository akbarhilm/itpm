const database = require("../conf/db/db");
const oracledb = require("oracledb");

async function find(params){

    let  query=`select i_itpm_planreal as idplanreal, 
    i_itpm_proj as idproj, 
    i_itpm_acty as idkegiatan, 
    c_itpm_planreal as kodeplanreal, 
    i_emp_actyassign as nikpelaksana, 
    d_itpm_actystart as tglmulai, 
    d_itpm_actyfinish as tglselesai 
    from dbadmit.tmitpmplanreal`
    const param ={}
    if (Object.keys(params).some(function(k) {return params[k];})) {
        // console.dir(!!params)
        query += `\n where`;
        if (Object.keys(params).find((x) => x == "idproj")) {
            query += `\n I_ITPM_PROJ = :idproj`;
            param.idproj = params.idproj
        }

        if (Object.keys(params).find((x) => x == "idplanreal")) {
            query += `\n I_ITPM_planreal = :idplanreal`;
            param.idplanreal = params.idplanreal
        }
    }

    const result = await database.exec(query, param);
    return result.rows;
}