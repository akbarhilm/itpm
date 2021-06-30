const database = require('../conf/db/db')

async function find(params){
   
let query=`select I_ITPM_SC as idlayanan, I_ITPM_SCNBR as nolayanan ,I_EMP_REQ as nikreq,
    C_ITPM_SC as kodelayanan,
    N_ITPM_APPL as namaaplikasi,
    E_ITPM_APPL as ketaplikasi,
    C_ITPM_ACTV as kodeaktif,
    N_ITPM_MDL as namamodul,
    E_ITPM_SC as ketlayanan,
    I_EMP_PM as nikpm
    from   DBADMIT.TMITPMSC 
    `
    if(params){
        query+=`where I_ITPM_SC = :id`
    }

    const result = await database.exec(query,params)
    return result.rows;
}

async function findUnsed(params){
    const param = {}
    console.dir(params)
    let query=`select I_ITPM_SC as idlayanan, I_ITPM_SCNBR as nolayanan ,I_EMP_REQ as nikreq,
    C_ITPM_SC as kodelayanan,
    N_ITPM_APPL as namaaplikasi,
    E_ITPM_APPL as ketaplikasi,
    C_ITPM_ACTV as kodeaktif,
    N_ITPM_MDL as namamodul,
    E_ITPM_SC as ketlayanan,
    I_EMP_PM as nikpm
    from   DBADMIT.TMITPMSC a
    where not exists (select 1 from dbadmit.tmitpmproj b where B.I_ITPM_SC = a.i_itpm_sc)`
    if(params.idproj){
        console.dir('masuk')
        param.idproj = params.idproj
        query+=`
union all
SELECT A.I_ITPM_SC as idlayanan, A.I_ITPM_SCNBR as nolayanan ,A.I_EMP_REQ as nikreq,
    A.C_ITPM_SC as kodelayanan,
    A.N_ITPM_APPL as namaaplikasi,
    A.E_ITPM_APPL as ketaplikasi,
    A.C_ITPM_ACTV as kodeaktif,
    A.N_ITPM_MDL as namamodul,
   A.E_ITPM_SC as ketlayanan,
    A.I_EMP_PM as nikpm
    from   DBADMIT.TMITPMSC A
    LEFT JOIN DBADMIT.TMITPMPROJ B ON A.I_ITPM_SC = B.I_ITPM_SC
    WHERE B.I_ITPM_PROJ = :idproj
    `
    }
    
    const result = await database.exec(query,param)
    return result.rows;
}

async function add(params){
    let query=`insert into DBADMIT.TMITPMSC (
        I_ITPM_SCNBR,
        I_EMP_REQ,
        C_ITPM_SC,
        N_ITPM_APPL,
        E_ITPM_APPL,
        C_ITPM_ACTV,
        N_ITPM_MDL,
        E_ITPM_SC,
        I_EMP_PM,
        i_entry,
        d_entry)
        values(
            :nolayanan,
            :nikreq,
            :newordev,
            :namaapl,
            :ketapl,
            :aktif,
            :namamodul,
            :ketlayanan,
            :nikpm,
            :identry,
            sysdate)
        `

       // const param = {}
        
        const result = await database.exec(query,params,{autoCommit:true})
        return result.rowsAffected;
}

module.exports.add = add
module.exports.find = find
module.exports.findUnsed = findUnsed