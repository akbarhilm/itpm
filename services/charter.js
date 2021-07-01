const database = require('../conf/db/db')
const oracledb = require('oracledb');

async function find(params){

    let query = `select I_ITPM_CHARTER   idcharter,
  I_ITPM_PROJ       idproj,
  I_ITPM_CHARTERNBR  nocharter,
  D_ITPM_CHARTERSTART   tglmulai,
  D_ITPM_CHARTERFINISH  tglselesai,
  C_ITPM_ACTV          kodeaktif,
  C_ITPM_APPRV         kodeapprove
  from dbadmit.tmitpmcharter`

  if(params){
      query+=`where I_ITPM_CHARTER = :id`
  }

  const result = await database.exec(query,params)
    return result.rows;
}

async function add(params){
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
      :tglmulai,
      :tglselesai,
      1,
      :identry,
      sysadate,
      :kodeapprove
  ) returning i_itpm_charter into :idcharter`

  params.idcharter = {dir:oracledb.BIND_OUT}
        
        const result = await database.exec(query,params,{autoCommit:true})
        params.idcharter = result.outBinds.idcharter[0];
        return params
}

module.exports.find = find