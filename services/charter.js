const database = require('../conf/db/db')
const oracledb = require('oracledb');

async function find(params) {

    let query = `select I_ITPM_CHARTER   idcharter,
  I_ITPM_PROJ       idproj,
  I_ITPM_CHARTERNBR  nocharter,
  to_char(D_ITPM_CHARTERSTART,'dd/mm/yyyy')   tglmulai,
  to_char(D_ITPM_CHARTERFINISH,'dd/mm/yyyy')  tglselesai,
  C_ITPM_ACTV          kodeaktif,
  C_ITPM_APPRV         kodeapprove
  from dbadmit.tmitpmcharter`

    if (!Object.keys(params).length == 0) {
        // console.dir(!!params)
        query += `\n where`
        if (Object.keys(params).find(x => x == 'idproj')) {
            query += `\n I_ITPM_PROJ = :idproj`
        }

        if (Object.keys(params).find(x => x == 'idcharter')) {
            query += `\n I_ITPM_CHARTER = :idcharter`
        }
    }

    const result = await database.exec(query, params)
    return result.rows;
}

async function addParent(params) {
    const nocharter = await noCharter()
    console.dir(nocharter[0].NOCHARTER)
    let query = `insert into dbadmit.tmitpmcharter (
  I_ITPM_PROJ       ,
  I_ITPM_CHARTERNBR ,
  D_ITPM_CHARTERSTART,
  D_ITPM_CHARTERFINISH ,
  C_ITPM_ACTV          ,
  I_ENTRY,
  D_ENTRY,
  C_ITPM_APPRV )
  VALUES(
      :idproj,
      :nocharter,
      to_date(:tglmulai,'dd/mm/yyyy'),
      to_date(:tglselesai,'dd/mm/yyyy'),
      1,
      :identry,
      sysdate,
      0
  ) returning i_itpm_charter into :idcharter`

    const param = {}
    param.nocharter = nocharter[0].NOCHARTER
    param.idproj = params.idproj
    param.tglmulai = params.tglmulai
    param.tglselesai = params.tglselesai
    param.identry = params.identry


    param.idcharter = { dir: oracledb.BIND_OUT }

    const result = await database.seqexec(query, param, [], false)
    param.idcharter = result.outBinds.idcharter[0];
    return param
}

async function noCharter(){
    let query=`select trim(to_char(nvl(nomer,'1'),'000'))||'/PRC/IT000/'||to_char(sysdate,'mm')||'/'||to_char(sysdate,'yyyy') as nocharter from(
        select trim(to_char(max(substr(i_itpm_charternbr ,0,3))+1,'000')) as nomer, null as tahun from dbadmit.tmitpmcharter where substr(i_itpm_charternbr,-4) = to_char(sysdate,'yyyy')
        )
    `
    const result = await database.exec(query)
    return result.rows
}

async function addChild(params, commit, last) {
    let query = `INSERT INTO dbadmit.tmitpmcharterdtl
    (
        I_ITPM_CHARTER,
        C_ITPM_CHARTERDTL,
        I_ITPM_CHARTERDTLSORT,
        E_ITPM_CHARTERDTL,
        C_ITPM_TARGETSTAT
    )VALUES(
        :idcharter,
        :kodedetail,
        :kodesort,
        :keterangan,
        0
    )returning i_itpm_charterdtl into :iddetail`
    params.iddetail = { dir: oracledb.BIND_OUT }

    const result = await database.seqexec(query, params, commit, last)
    params.iddetail = result.outBinds.iddetail[0];
    return params
}

async function editParent(params) {
    console.dir("edit")
    const res = []
    let query = `update dbadmit.tmitpmcharter 
       
        set D_ITPM_CHARTERSTART =  to_date(:tglmulai,'dd/mm/yyyy'),
        D_ITPM_CHARTERFINISH = to_date(:tglselesai,'dd/mm/yyyy') ,
        I_UPDATE = :idubah        ,
        D_UPDATE = sysdate
        where I_ITPM_CHARTER = :idcharter`

    const param = {}
    param.tglmulai = params.tglmulai
    param.tglselesai = params.tglselesai
    param.idubah = params.idubah
    param.idcharter = params.idcharter




    const result = await database.seqexec(query, param, [], false)
    return param
}

async function deleteChild(params) {
    console.dir("del")
    let query = `delete dbadmit.tmitpmcharter where i_itpm_charter = :idcharter`
    const param ={}
    param.idcharter = params.idcharter
    const result = await database.seqexec(query, param, [], false)
    return result.rowsAffected

}

module.exports.deleteChild = deleteChild
module.exports.editParent = editParent
module.exports.addChild = addChild
module.exports.addParent = addParent
module.exports.find = find