const database = require("../conf/db/db");
const oracledb = require("oracledb");

async function find(params) {
    let query = `select I_ITPM_UREQ   idureq,
        I_ITPM_PROJ       idproj,
         N_ITPM_UREQ  namaureq,
         E_ITPM_UREQ  ketureq,
         I_ITPM_UREQPRTY  prioritas,
         N_ITPM_USECASE   usecase,
        C_ITPM_ACTV          kodeaktif,
        I_DOC_UREQ dokumen
         from dbadmit.tmitpmureq`;
    const param = {}
    if (Object.keys(params).some(function(k) {return params[k];})) {
        // console.dir(!!params)
        query += `\n where`;
        if (Object.keys(params).find((x) => x == "idproj")) {
            query += `\n I_ITPM_PROJ = :idproj`;
            param.idproj = params.idproj
        }

        if (Object.keys(params).find((x) => x == "idureq")) {
            query += `\n I_ITPM_UREQ = :idureq`;
            param.idureq = params.idureq
        }
    }

    const result = await database.exec(query, param);
    return result.rows;
}

async function add(params,commit,conn){
   
    let query=`insert into dbadmit.tmitpmureq(
        I_ITPM_PROJ,
         N_ITPM_UREQ,
         E_ITPM_UREQ,
         I_ITPM_UREQPRTY ,
         N_ITPM_USECASE,
        C_ITPM_ACTV,
        I_DOC_UREQ,
        I_ENTRY,
        D_ENTRY
    )VALUES(
        :idproj,
        :namaureq,
        :ketureq,
        :prioritas,
        :usecase,
        1,
        :dokumen,
        :identry,
        sysdate
    ) returning i_itpm_ureq into :idureq`

    const param = {}
    param.idproj = params.idproj
    param.namaureq = params.namaureq
    param.ketureq = params.ketureq
    param.prioritas = params.prioritas
    param.usecase = params.usecase
    param.identry = params.identry
    param.dokumen = params.dokumen
    param.idureq = { dir: oracledb.BIND_OUT }

    const result = await database.seqexec(query, param, commit,conn)
    param.idureq = result.outBinds.idureq[0];
    return param
}

async function del(params,commit,conn){

    let query=`delete dbadmit.tmitpmureq where i_itpm_proj = :idproj`
    const param = {}
    param.idproj = params.idproj
    const result = await database.seqexec(query,param,commit,conn)
    return result.rowsAffected
}

async function edit(params){

    let query=`update dbadmit.tmitpmureq set
    N_ITPM_UREQ = :namaureq,
         E_ITPM_UREQ = :ketureq,
         I_ITPM_UREQPRTY = :prioritas,
         N_ITPM_USECASE = :usecase,
         I_update = :idubah,
         d_update = sysdate
         where i_itpm_ureq = :idureq
    `

    const param = {}
    param.idureq = params.idureq
    param.namaureq = params.namaureq
    param.ketureq = params.ketureq
    param.prioritas = params.prioritas
    param.usecase = params.usecase
    param.idubah = params.idubah

    const result = await database.exec(query,param)
    if(result.rowsAffected ==1){
      return  find({idureq:param.idureq})
    }else{
    return result
    }

}

module.exports.del = del
module.exports.edit = edit
module.exports.find = find
module.exports.add = add