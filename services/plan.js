const database = require("../conf/db/db");
const oracledb = require("oracledb");

async function find(params) {

    let query = `select i_itpm_planreal as idplanreal, 
    i_itpm_proj as idproj, 
    i_itpm_acty as idkegiatan, 
    c_itpm_planreal as kodeplanreal, 
    i_emp_actyassign as nikpelaksana, 
    to_char(d_itpm_actystart,'dd/mm/yyyy') as tglmulai, 
    to_char(d_itpm_actyfinish,'dd/mm/yyyy') as tglselesai 
    from dbadmit.tmitpmplanreal`;
    const param = {};
    if (Object.keys(params).some(function (k) { return params[k]; })) {
        // console.dir(!!params)
        query += `\n where`;
        if (Object.keys(params).find((x) => x == "idproj")) {
            query += `\n I_ITPM_PROJ = :idproj and c_itpm_planreal='PLAN' `;
            param.idproj = params.idproj;
        }

        if (Object.keys(params).find((x) => x == "idplanreal")) {
            query += `\n I_ITPM_planreal = :idplanreal and c_itpm_planreal='PLAN'`;
            param.idplanreal = params.idplanreal;
        }
    }

    const result = await database.exec(query, param);
    return result.rows;
}

async function addPlan(params, commit, conn) {
    let query = `insert into dbadmit.tmitpmplanreal(
        i_itpm_proj,
        i_itpm_acty,
        c_itpm_planreal,
        i_emp_actyassign,
        d_itpm_actystart,
        d_itpm_actyfinish,
        i_entry,
        d_entry)values(
        :idproj, 
        :idkegiatan, 
        'PLAN', 
        :nik, 
        to_date(:tglmulai,'dd/mm/yyyy'), 
        to_date(:tglselesai,'dd/mm/yyyy'),
        :identry,
         sysdate)`;

    const param = {};
    param.idproj = params.idproj;
    param.idkegiatan = params.idkegiatan;
    param.nik = params.nik;
    param.tglmulai = params.tglmulai;
    param.tglselesai = params.tglselesai;
    param.identry = params.identry;

    //param.idplanreal = { dir: oracledb.BIND_OUT }
    //  console.dir(params)
    //const result = await database.execmany(query, params) //exec many
    const result = await database.seqexec(query, param, commit, conn);
    // param.idplanreal = result.outBinds.idplanreal[0];
    return result;
}



async function delplan(param, commit, conn) {
    let query = `delete dbadmit.tmitpmplanreal
    where i_itpm_proj = :idproj
    and c_itpm_planreal = 'PLAN'`;


    const result = await database.seqexec(query, param, commit, conn);
    return result.rowsAffected;
}

module.exports.delplan = delplan;
module.exports.addPlan = addPlan;
module.exports.find = find;