const database = require("../conf/db/db");
const oracledb = require("oracledb");

async function find(params) {

    let query = `select i_itpm_planreal as idplanreal, 
    i_itpm_proj as idproj, 
    i_itpm_acty as idkegiatan, 
    c_itpm_planreal as kodeplanreal, 
    i_emp_actyassign as nikpelaksana, 
    to_char(d_itpm_actystart,'dd/mm/yyyy') as tglmulai, 
    to_char(d_itpm_actyfinish,'dd/mm/yyyy') as tglselesai,
    nvl(v_itpm_progress,0) as progress,
    nvl(i_itpm_auth,0) as idrole
    from dbadmit.tmitpmplanreal
    where c_itpm_planreal = 'REALISASI'`;
    const param = {};
    if (Object.keys(params).some(function (k) { return params[k]; })) {
        // console.dir(!!params)
        query += `\n and`;
        if (Object.keys(params).find((x) => x == "idproj")) {
            query += `\n I_ITPM_PROJ = :idproj`;
            param.idproj = params.idproj;
        }

        if (Object.keys(params).find((x) => x == "idplanreal")) {
            query += `\n I_ITPM_planreal = :idplanreal`;
            param.idplanreal = params.idplanreal;
        }
    }

    const result = await database.exec(query, param);
    return result.rows;
}




async function addReal(params, commit, conn) {
    let query = `insert into dbadmit.tmitpmplanreal(
        i_itpm_proj,
        i_itpm_acty,
        c_itpm_planreal,
        i_emp_actyassign,
        d_itpm_actystart,
        d_itpm_actyfinish,
        i_itpm_auth,
        v_itpm_progress,
        i_entry,
        d_entry)values(
        :idproj, 
        :idkegiatan, 
        'REALISASI', 
        :nik, 
        to_date(:tglmulai,'dd/mm/yyyy'), 
        to_date(:tglselesai,'dd/mm/yyyy'),
        :idrole,
        :progress,
        :identry,
         sysdate)`;

    const param = {};
    param.idproj = params.idproj;
    param.idkegiatan = params.idkegiatan;
    param.nik = params.nik;
    param.tglmulai = params.tglmulai;
    param.tglselesai = params.tglselesai;
    param.identry = params.identry;
    param.progress = params.progress
    param.idrole = params.idrole
console.log(param)
    //param.idplanreal = { dir: oracledb.BIND_OUT }
    //  console.dir(params)
    //const result = await database.execmany(query, params) //exec many
    const result = await database.seqexec(query, param, commit, conn);
    // param.idplanreal = result.outBinds.idplanreal[0];
    return result;
}



async function delreal(param, commit, conn) {
    let query = `delete dbadmit.tmitpmplanreal
    where i_itpm_proj = :idproj
    and c_itpm_planreal = 'REALISASI'`;


    const result = await database.seqexec(query, param, commit, conn);
    return result.rowsAffected;
}

module.exports.delreal = delreal;
module.exports.addReal = addReal;
module.exports.find = find;
