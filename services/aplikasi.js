const database = require('../conf/db/db')

async function find(params){
    
let query=`select I_ITPM_APPL as idaplikasi,
C_ITPM_APPL as kodeaplikasi,
N_ITPM_APPL as namaaplikasi,
E_ITPM_APPL as ketaplikasi,
C_ITPM_ACTV as kodeaktif

    from   DBADMIT.TRITPMAPPL
   
    `
   if(params){
       query+=` where i_itpm_appl = :id`
   }

    const result = await database.exec(query,params)
    return result.rows;
}

async function add(params){
    let query=`insert into DBADMIT.TRITPMAPPL ( 
        C_ITPM_APPL,
        N_ITPM_APPL,
        E_ITPM_APPL,
        C_ITPM_ACTV,
        I_ENTRY,
        D_ENTRY)
        VALUES(
            :kodeapl,
            :namaapl,
            :ketapl,
            :aktif,
            :identry,
            sysdate)
        `

       // const param = {}
        
        const result = await database.exec(query,params)
        return result.rowsAffected;
}

module.exports.add = add
module.exports.find = find