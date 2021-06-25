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
    if(!Object.keys(params).length==0){
       // console.dir(!!params)
        query+=`\n where`
        if(Object.keys(params).find(x=>x=='idmodul')){
    query+=`\n I_ITPM_mdl = :idmodul`
        }
        if(Object.keys(params).length>1){
            query+=` and`
        }
        if(Object.keys(params).find(x=>x=='idaplikasi')){
            query+=`\n I_ITPM_APPL = :idaplikasi`
        }
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
            1,
            :identry,
            sysdate)
        `

       // const param = {}
        
        const result = await database.exec(query,params,{autoCommit:true})
        console.dir(result)
        return result.rowsAffected;
}

module.exports.add = add
module.exports.find = find