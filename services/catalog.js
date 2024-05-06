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
            from tmitpmservcataloque`
    const rest = await database.exec(query)
    return rest.rows
}

async function combocat(){
    let query=`SELECT a.I_SERV as kode, a.N_SERV as nama, a.E_SERV as keterangan
    FROM DBADMIT.TMITPMSERVCATALOQUE a
    WHERE a.I_SERV_STAT != 4`

    const rest = await database.exec(query)
   
    return rest.rows
}

module.exports.find = find
module.exports.combocat = combocat