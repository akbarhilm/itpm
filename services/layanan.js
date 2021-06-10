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
        query+=`where i_itpm_sc = :id`
    }

    const result = await database.exec(query,params)
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
        
        const result = await database.exec(query,params)
        return result.rowsAffected;
}

module.exports.add = add
module.exports.find = find