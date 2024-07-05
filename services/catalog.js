const database = require('../conf/db/db')
const oracledb = require('oracledb');

async function find(params){
    let query=`select i_serv as idkatalog,
            a.i_serv_type as typekatalog,
            b.n_serv_type as namatype,
            b.e_serv_type as kettype,
            n_serv as namakatalog,
            e_serv as ketkatalog,
            a.i_serv_categ as idkategori,
            c.n_serv_categ as namakategori,
            e_serv_relation as ketrelasi,
            a.i_serv_stat as statuskatalog,
            d.n_serv_stat as namastatus,
            d.e_serv_stat as ketstatus,
            a.i_serv_team as timkatalog,
            e.n_serv_team as namatim,
            c_serv_prior as prioritaskatalog,
            a.i_serv_sla as slakatalog
            f.n_serv_sla
            from tmitpmservcataloque
            
           `
    const rest = await database.exec(query)
    return rest.rows
}

async function find2(params){
    let query=` select a.I_SERV kodekatalog, a.C_SERV_TYPE typeservice, b.N_SERV_TYPE namaservice, a.N_SERV namalayanan, a.E_SERV ketlayanan, a.C_SERV_CATEG kodecat, f.N_SERV_CATEG namacat, a.E_SERV_RELATION ketrelasi, 
	a.I_SERV_STAT as status, c.N_SERV_STAT namastatus,  c.E_SERV_STAT ketstatus, a.I_SERV_TEAM kodeteam, d.N_SERV_TEAM namateam,
	a.C_SERV_PRIOR kodeprioritas, a.I_SERV_SLA kodesla, e.N_SERV_SLA namasla
from DBADMIT.TMITPMSERVCATALOQUE a
join DBADMIT.TRITPMSERVTYPE b on (a.C_SERV_TYPE= b.c_SERV_TYPE)
join DBADMIT.TRITPMSERVCATEG f on (a.C_SERV_CATEG= f.C_SERV_CATEG)
join DBADMIT.TRITPMSERVSTAT c on (a.I_SERV_STAT = c.I_SERV_STAT)
join DBADMIT.TRITPMSERVTEAM d on (a.I_SERV_TEAM = d.I_SERV_TEAM)
join DBADMIT.TRITPMSERVSLA e on (a.I_SERV_SLA = e.I_SERV_SLA)
order by a.C_SERV_TYPE, a.I_SERV`

const rest = await database.exec(query)
return rest.rows
}

async function addCata(params){
    let query=`
    insert into TMITPMSERVCATALOQUE
    (I_SERV,
        C_SERV_TYPE,
        N_SERV,
        E_SERV,
        C_SERV_CATEG,
        E_SERV_RELATION,
        I_SERV_STAT,
        I_SERV_TEAM,
        C_SERV_PRIOR,
        I_SERV_SLA,
        I_ENTRY,
        D_ENTRY)
    values
    (:idkatalog,
        :typekatalog,
        :namakatalog,
        :ketkatalog,
        :kodekategori,
        :ketrelasi,
        :idstatus,
        :idteam,
        :kodeprior,
        :idsla,
        :identry,
        sysdate)returning I_ID_SERV into :idtable`

        const param={}
        param.typekatalog= params.typekatalog
        param.namakatalog= params.namakatalog
        param.ketkatalog= params.ketkatalog
        param.kodekategori= params.kodekategori
        param.ketrelasi= params.ketrelasi
        param.idstatus= params.idstatus
        param.idteam= params.idteam
        param.kodeprior= params.kodeprior
        param.idsla= params.idsla
        param.identry= params.identry

        param.idtable = { dir: oracledb.BIND_OUT }
  const result = await database.exec(query, param)
    param.idtable = result.outBinds.idtable[0];
    param.rowsAffected = result.rowsAffected

    return param

}

async function editCata(params){
    let query=`
    update TMITPMSERVCATALOQUE 
    
    set C_SERV_TYPE= :typekatalog,
    N_SERV= :namakatalog,
    E_SERV= :ketkatalog,
    C_SERV_CATEG= :kodekategori,
    E_SERV_RELATION=  :ketrelasi,
    I_SERV_STAT=  :idstatus,
    I_SERV_TEAM= :idteam,
    C_SERV_PRIOR=  :kodeprior,
    I_SERV_SLA= :idsla,
    `
    const param={}
        param.typekatalog= params.typekatalog
        param.namakatalog= params.namakatalog
        param.ketkatalog= params.ketkatalog
        param.kodekategori= params.kodekategori
        param.ketrelasi= params.ketrelasi
        param.idstatus= params.idstatus
        param.idteam= params.idteam
        param.kodeprior= params.kodeprior
        param.idsla= params.idsla

        const result = await database.exec(query, param)
        param.rowsAffected = result.rowsAffected
    return param
}

async function delCata(param){
    let query =`delete DBADMIT.TMITPMSERVCATALOQUE 
    where I_SERV = :idkatalog`

    const res = await database.exec(query,param)
}

async function combocat(){
    let query=`SELECT a.I_SERV as kode, a.N_SERV as nama, a.E_SERV as keterangan
    FROM DBADMIT.TMITPMSERVCATALOQUE a
    WHERE a.I_SERV_STAT != 4`

    const rest = await database.exec(query)
   
    return rest.rows
}

async function kodecata(){
    let query=`select to_char(nvl(max(trim(substr(I_SERV,5,3)))+1,1),'000') as next from dbadmit.tmitpmservcataloque`

    const res = await database.exec(query)
    return res.rows
}

module.exports.kodecata = kodecata
module.exports.addCata = addCata
module.exports.editCata = editCata
module.exports.delCata = delCata
module.exports.find2 = find2
module.exports.find = find
module.exports.combocat = combocat