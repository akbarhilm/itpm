const database = require('../conf/db/db')

async function find(params){

let query=`select  I_ITPM_MDL as idmodul,
I_ITPM_APPL as idaplikasi,
N_ITPM_MDL as namamodul,
E_ITPM_MDL as ketmodul,
C_ITPM_ACTV as kodeaktif
    from   DBADMIT.TRITPMMDL
    `
    const param = {}
    if(params){
    
    query+=`\n where I_ITPM_mdl = :id`
    }
    const result = await database.exec(query,params)
    return result.rows;
}

async function add(params){
    let query=` insert into DBADMIT.TRITPMMDL(
        I_ITPM_APPL,
        N_ITPM_MDL,
        E_ITPM_MDL,
        C_ITPM_ACTV,
        I_ENTRY,
        D_ENTRY)
        VALUES(
            :idapl,
            :namamodul,
            :ketmodul,
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