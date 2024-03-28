const database = require('../conf/db/db')
const oracledb = require('oracledb');

async function find(params) {

    let query = `select i_itpm_uat as iduat,
    i_itpm_proj as idproj,
    i_itpm_uatnbr as nouat,
    c_itpm_useraprv as aproveuser,
    e_itpm_useraprv as ketaprove,
    d_itpm_useraprv as tglaproveuser,
    i_emp_qa as nikqa,
    c_itpm_qaaprv as aproveqa,
    d_itpm_qaaprv as tglaproveqa,
    I_DOC_UAT as dokumen
     from dbadmit.tmitpmuat`

    if (!Object.keys(params).length == 0) {
        // //console.dir(!!params)
        query += `\n where`
        if (Object.keys(params).find(x => x == 'idproj')) {
            query += `\n I_ITPM_PROJ = :idproj`
        }

        if (Object.keys(params).find(x => x == 'iduat')) {
            query += `\n I_ITPM_UAT = :iduat`
        }
    }
    query+=` order by d_entry desc`
    ////console.dir(query)
    const result = await database.exec(query, params)
    return result.rows;
}

async function findChild(params){
    let query =`   select I_itpm_uatdtl as iddetail,
    i_itpm_uat as iduat,
    c_itpm_empuat as kodeuat,
    i_emp_uat as nikuat 
     from dbadmit.tmitpmuatdtl
    where i_itpm_uat = :iduat`

    const param = {}
    param.iduat  = params.iduat

    const result = await database.exec(query, param)
    return result.rows;
}

async function addParent(params,commit,conn) {
    const nouat = await noUat()
    //console.dir(nouat[0].NOUAT)
    let query = `insert into dbadmit.tmitpmuat (
        i_itpm_proj,
        i_itpm_uatnbr,
        c_itpm_useraprv,
        c_itpm_qaaprv,
        I_DOC_UAT,
        i_entry,
        d_entry
        )values(
        :idproj,
        :nouat,
        0,
        0,
        :dokumen,
        :identry,
        sysdate
  ) returning i_itpm_uat into :iduat`

    const param = {}
    param.nouat = nouat[0].NOUAT,
     param.idproj= params.idproj ,
    param.identry= params.identry 
    param.dokumen = params.dokumen

    param.iduat = { dir: oracledb.BIND_OUT }

    const result = await database.seqexec(query, param, commit,conn)
    param.iduat = result.outBinds.iduat[0];
    return param
}

async function noUat(){
    let query=`select trim(to_char(nvl(nomer,'1'),'000'))||'/UAT/IT0000/'||to_char(sysdate,'mm')||'/'||to_char(sysdate,'yyyy') as nouat from(
        select trim(to_char(max(substr(i_itpm_uatnbr ,0,3))+1,'000')) as nomer, null as tahun from dbadmit.tmitpmuat where substr(i_itpm_uatnbr,-4) = to_char(sysdate,'yyyy')
        )
    `
    const result = await database.exec(query)
    return result.rows
}

async function addChild(params, commit, conn) {
    let query = `INSERT INTO dbadmit.tmitpmuatdtl
    (
        i_itpm_uat,
    c_itpm_empuat,
    i_emp_uat
  
    )VALUES(
        :iduat,
   :kodeuat,
    :nikuat
    )returning i_itpm_uatdtl into :iddetail`
    //console.dir(params)
    const param = {}
    param.iduat = params.iduat
    param.kodeuat = params.kodeuat
    param.nikuat = params.nikuat

    param.iddetail = { dir: oracledb.BIND_OUT }

    const result = await database.seqexec(query, param, commit, conn)
    param.iddetail = result.outBinds.iddetail[0];
    return param
}

// async function editParent(params,commit,conn) {
    
//     const res = []
//     let query = `update dbadmit.tmitpmuat 
       
//     set
//     i_itpm_uatnbr as nouat,
//     c_itpm_useraprv as aproveuser,
//     e_itpm_useraprv as ketaprove,
//     d_itpm_useraprv as tglaproveuser,
//     i_emp_qa as nikqa,
//     c_itpm_qaaprv as aproveqa,
//     d_itpm_qaaprv as tglaproveqa
//     i_itpm_uat as iduat,
//     i_itpm_proj as idproj,`

//     const param = {}
//     param.tglmulai = params.tglmulai
//     param.tglselesai = params.tglselesai
//     param.idubah = params.idubah
//     param.idcharter = params.idcharter




//     const result = await database.seqexec(query, param, commit, conn)
//     return param
// }

async function deleteChild(params,commit,conn) {
    //console.dir("del")
    let query = `delete dbadmit.tmitpmuatdtl where i_itpm_uat = :iduat`
    const param ={}
    param.iduat = params.iduat
    const result = await database.seqexec(query, param, commit, conn)
    return result.rowsAffected

}

async function approveuser(params){

    let query=`update dbadmit.tmitpmuat
    set c_itpm_useraprv = :kodeaprove,
         e_itpm_useraprv = nvl(:ketaprove,e_itpm_useraprv),
     d_itpm_useraprv = sysdate,
     i_update = :idubah,
     d_update = sysdate
    where i_itpm_uat = :iduat`

    const param = {}
    param.iduat = params.iduat
    param.kodeaprove = params.kodeaprove
    param.ketaprove = params.ketaprove
    param.idubah = params.idubah
    const result  = await database.exec(query,param)
    return result.rowsAffected
}

async function approvebyUAT(params){

    let query=`update dbadmit.tmitpmcharter
    set c_itpm_apprv = 1,
     i_update = :idubah,
     d_update = sysdate
    where i_itpm_proj = (select i_itpm_proj from dbadmit.tmitpmuat where i_itpm_uat = :iduat)`

    const param = {}
    param.iduat = params.iduat
    param.idubah = params.idubah
    const result  = await database.exec(query,param)
    return result.rowsAffected
}

async function approveqa(params){

    let query=`update dbadmit.tmitpmuat
    set i_emp_qa = :idubah,
         c_itpm_qaaprv = 1,
         d_itpm_qaaprv = sysdate,
         i_update = :idubah,
     d_update = sysdate
    where i_itpm_uat = :iduat`

    const param ={}
    param.idubah = params.idubah
    param.iduat = params.iduat

    const result  = await database.exec(query,param)
    return result.rowsAffected
}

async function failApproveqa(params){
    let query=`update dbadmit.tmitpmuat
    set i_emp_qa = null,
         c_itpm_qaaprv = 0,
         d_itpm_qaaprv = null,
         i_update = null,
     d_update = null
    where i_itpm_uat = :iduat`

    const param ={}
    //param.idubah = params.idubah
    param.iduat = params.iduat

    const result  = await database.exec(query,param)
    return result.rowsAffected
}

async function savefile(params){
    let query=`update dbadmit.tmitpmuat
    set I_DOC_UAT = :filename
    where i_itpm_proj = :idproyek`

    const param ={}
    param.filename = params.filename
    param.idproyek = params.idproyek

    const res = await database.exec(query,param)
    return res.rowsAffected
}

module.exports.savefile = savefile
module.exports.approvebyUAT = approvebyUAT
module.exports.failApproveqa = failApproveqa
module.exports.approveuser = approveuser
module.exports.approveqa = approveqa
module.exports.findChild = findChild
module.exports.deleteChild = deleteChild
//module.exports.editParent = editParent
module.exports.addChild = addChild
module.exports.addParent = addParent
module.exports.find = find