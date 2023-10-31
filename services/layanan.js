const database = require('../conf/db/db')
const oracledb = require('oracledb');
async function find(params){
   
let query=`select I_ITPM_SC as idlayanan, I_ITPM_SCNBR as nolayanan ,I_EMP_REQ as nikreq,
    C_ITPM_SC as kodelayanan,
    N_ITPM_APPL as namaaplikasi,
    E_ITPM_APPL as ketaplikasi,
    C_ITPM_ACTV as kodeaktif,
    N_ITPM_MDL as namamodul,
    E_ITPM_SC as ketlayanan,
    I_EMP_PM as nikpm,
    N_PRIORITY_LVL as prioritas,
    I_TCKT as notiket
    from   DBADMIT.TMITPMSC 
    `
    const param = {}
    if (params.id) {
        param.id = params.id
        
        query+=`where I_ITPM_SC = :id`
    }

      
    

    const result = await database.exec(query,param)
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
    I_EMP_PM as nikpm,
    N_PRIORITY_LVL as prioritas,
    I_TCKT as notiket
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
    A.I_EMP_PM as nikpm,
    N_PRIORITY_LVL as prioritas,
    I_TCKT as notiket
    from   DBADMIT.TMITPMSC A
    LEFT JOIN DBADMIT.TMITPMPROJ B ON A.I_ITPM_SC = B.I_ITPM_SC
    WHERE B.I_ITPM_PROJ = :idproj
    `
    query+=`order by 1 desc`
    }
    
    const result = await database.exec(query,param)
    return result.rows;
}

async function add(params){
    const nomer = await getNomerLayanan()
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
        N_PRIORITY_LVL,
        I_TCKT,
        i_entry,
        d_entry)
        values(
            :nomorlayanan,
            :nikreq,
            :newordev,
            :namaapl,
            :ketapl,
            1,
            :namamodul,
            :ketlayanan,
            :nikpm,
            :priority,
            :notiket,
            :identry,
            sysdate)
            returning i_itpm_sc into :idlayanan
        `
         
        const param = {}
        param.nomorlayanan = nomer
        param.nikreq = params.nikreq
        param.newordev = params.newordev
        param.namaapl = params.namaapl
        param.ketapl = params.ketapl
        param.namamodul = params.namamodul
        param.ketlayanan = params.ketlayanan
        param.nikpm = params.nikpm
        param.priority = params.priority
        param.notiket = params.notiket
        param.identry = params.identry

       param.idlayanan = {dir:oracledb.BIND_OUT}
   // console.dir(query);
    //console.dir(param)  
    const result = await database.exec(query,param)
    
    param.idlayanan = parseInt(result.outBinds.idlayanan[0]);

    return param
        
        
}

async function getNomerLayanan(){
    let query=`(select trim(to_char(nvl(nomer,'1'),'000'))||'/APL/IT0000/'||to_char(sysdate,'mm')||'/'||to_char(sysdate,'yyyy') as nomer from(
                select trim(to_char(max(substr(i_itpm_scnbr ,0,3))+1,'000')) as nomer from dbadmit.tmitpmsc where substr(i_itpm_scnbr,-4) = to_char(sysdate,'yyyy')
                ))`

                const result = await database.exec(query,[])        
                return result.rows[0].NOMER
}

module.exports.add = add
module.exports.find = find
module.exports.findUnsed = findUnsed
//module.exports.getNomerLayanan = getNomerLayanan
