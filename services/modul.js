const database = require('../conf/db/db')

async function find(params){
    //list
    let query=`SELECT
	I_ID AS Idmodul,
	N_PORTO_MODUL  as namamodul
FROM
	DBADMIT.TMITPMPORTOFOLIODTL 
WHERE
	I_IDPORTO = :idaplikasi
    And C_PORTO_ITEMSTAT = 'A'`

    const param = {}
    param.idaplikasi = params.idaplikasi
    const rest = await database.exec(query,param)

    return rest.rows
}



async function find2(params){

let query=`SELECT
I_ID AS Idmodul,
N_PORTO_MODUL  as namamodul
FROM
DBADMIT.TMITPMPORTOFOLIODTL
where I_ID = :idmodul `
const param = {}
    param.idmodul = params.idmodul
   //console.dir(query)
    const result = await database.exec(query,param)
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
        //console.dir(result)
        return result.rowsAffected;
}

module.exports.find2 =find2
module.exports.add = add
module.exports.find = find