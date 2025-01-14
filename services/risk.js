const database = require("../conf/db/db");
const oracledb = require("oracledb");


async function find(params){

    let query=`select i_itpm_riskprnt as idparent, i_itpm_risk as idrisk, i_itpm_proj as idproj,
    n_itpm_riskfctr as namafactor, c_itpm_risklikelihood as kodemungkin,
    c_itpm_riskimpact as kodeimpact
    from dbadmit.tmitpmrisk`
    const param = {}
    if (Object.keys(params).some(function(k) {return params[k];})) {
        // console.dir(!!params)
        query += `\n where`;
        if (Object.keys(params).find((x) => x == "idproj")) {
            query += `\n I_ITPM_PROJ = :idproj`;
            param.idproj = params.idproj
        }

        if (Object.keys(params).find((x) => x == "idureq")) {
            query += `\n I_ITPM_risk = :idrisk`;
            param.risk = params.risk
        }
    }
    //console.dir(query)
    const result = await database.exec(query, param);
    return result.rows;
}

async function add(params,commit,conn){

    let query=`insert into dbadmit.tmitpmrisk(
        i_itpm_proj,
        n_itpm_riskfctr,
        c_itpm_risklikelihood,
        c_itpm_riskimpact,
        i_itpm_riskprnt,
        i_entry,
        d_entry
        )values(
         :idproj,
         :namafactor,
         :kodemungkin,
         :kodeimpact,
         :parent,
         :identry,
         sysdate) returning i_itpm_risk into :idrisk`
        
         const param = {}
         param.idproj = params.idproj
         param.namafactor = params.namafactor
         param.kodemungkin = params.kodemungkin
         param.kodeimpact = params.kodeimpact
         param.identry = params.identry
        param.parent = params.parent
         param.idrisk = { dir: oracledb.BIND_OUT }

         const result = await database.seqexec(query, param, commit,conn)
         param.idrisk = result.outBinds.idrisk[0];
         return param
     
}

async function delrisk(params,commit,conn){
    let query=`delete dbadmit.tmitpmrisk where i_itpm_proj = :idproj`
    const param={}
    param.idproj = params.idproj
    const result = await database.seqexec(query, param, commit,conn)
    return result.rowsAffected
}

module.exports.delrisk = delrisk
module.exports.find = find
module.exports.add = add