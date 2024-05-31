const database = require('../conf/db/db')
const oracledb = require('oracledb');
async function find(){
    //list
let query=`SELECT I_ID as IDAPLIKASI,I_SERV as kodeaplikasi,
 N_PORTO_APL as namaaplikasi FROM DBADMIT.TMITPMPORTOFOLIO
WHERE C_PORTO_STATUS in ('PIPELINE', 'KATALOG')`

    const result = await database.exec(query)
    return result.rows;
}

async function findbyid(params){
    let query=`select I_ID as idaplikasi,
    I_SERV as kodeaplikasi,
    N_PORTO_APL as namaaplikasi,
    C_PORTO_GRP as grupaplikasi
    
    
        from   DBADMIT.TMITPMPORTOFOLIO
       
       
         where I_ID  = :idaplikasi
       
    `

    const param={}
    param.idaplikasi = params.idaplikasi
    const rest = await database.exec(query,param)
    return rest.rows
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
            1,
            :identry,
            sysdate)
            returning i_itpm_appl into :idaplikasi
        `

       params.idaplikasi = {dir:oracledb.BIND_OUT}
        
        const result = await database.exec(query,params,{autoCommit:true})
        params.idaplikasi = result.outBinds.idaplikasi[0];
        return params
}

module.exports.findbyid = findbyid
module.exports.add = add
module.exports.find = find