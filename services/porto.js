const database = require("../conf/db/db");
const oracledb = require("oracledb");

async function findParent(params) {
  let query = `
with data1 as (
  select I_ITPM_APPL, count(I_ITPM_PROJ) as jml
  from DBADMIT.TMITPMPROJ
  where I_ITPM_APPL is not null
  group by I_ITPM_APPL 
 )
 
 select d.I_ITPM_APPL as appl, a.I_ID as idporto, 
 case when d.I_ITPM_APPL is null then 'BOLEH DIHAPUS'
 else 'DILARANG HAPUS'
 end as "FLAG_HAPUS"
 ,a.I_PORTO as kodeporto, a.I_SERV as kodeservis, b.n_SERV as namaservis, a.N_PORTO_APL as namaaplikasi, a.N_PORTO_OWNER as namaowner, 
 a.C_PORTO_GRP as kodegrup, c.N_PORTO_GRP as namagrup, a.E_PORTO_URL as url, 
 a.C_PORTO_STATUS as status, a.N_PORTO_DEV as pengembang, a.N_PORTO_APLTYPE as tipeaplikasi, 
 TO_CHAR(a.D_PORTO_PUBLISH, 'DD-MM-YYYY') as publish,
 TO_CHAR(a.D_PORTO_RETIRED, 'DD-MM-YYYY') as retired,
 a.N_FILEAPPL as namafile
 from DBADMIT.TMITPMPORTOFOLIO a
 left join DBADMIT.TMITPMSERVCATALOQUE b on (a.I_SERV = b.I_SERV)
 inner JOIN DBADMIT.TRITPMPORTOFOLIOGRP c on (a.C_PORTO_GRP = c.C_PORTO_GRP)
 left join data1 d on (a.I_ID = d.I_ITPM_APPL)
 `
if (params) {
    query += `where a.i_id = :idporto`;
  }
  query += ` order by a.I_SERV, a.I_PORTO, a.D_PORTO_PUBLISH desc`;
console.dir(params);
  const rest = await database.exec(query, params);
 
  return rest.rows;
}

async function findChild(params) {
  let query = `select i_idporto as idproto,
            i_porto_item as modelnumber,
            n_porto_modul as namamodul,
            e_porto_modul as ketmodul,
            c_porto_itemstat as statusitem,
            d_porto_itempublish as tglitempubish,
            d_porto_itemretired as tglitemretired
            from DBADMIT.TMITPMPORTOFOLIOdtl
            where i_idporto = :idporto
    `;
  const param = {};
  param.idporto = params.idporto;
  const rest = await database.exec(query, param);
  return rest.rows;
}
async function editParent(params, commit, conn) {
  let query = `update dbadmit.tmitpmportofolio set
    i_serv = :kodebisnis,
    n_porto_apl = :namaaplikasi,
    n_porto_owner = :namabpo,
    c_porto_grp = :kodegrup,
    e_porto_url = :url,
    c_porto_status = :status,
    n_porto_dev = :namadev,
    n_porto_apltype = :tipeapl,
    n_fileappl = :namafile,
    d_porto_publish = to_date(:tglpublish,'dd/mm/yyyy'),
    d_porto_retired = to_date(:tglretired,'dd/mm/yyyy')
    where i_id = :idporto `;
  const param = {};
  param.idporto = params.idporto
  param.kodebisnis = params.cata;
  param.namaaplikasi = params.aplikasi;
  param.namabpo = params.bpo;
  param.kodegrup = params.grup;
  param.url = params.url;
  param.status = params.status;
  param.namadev = params.dev;
  param.tipeapl = params.tipe;
  param.tglpublish = params.publish === 'Invalid date'? null :params.publish ;
  param.tglretired = params.retired === 'Invalid date'? null :params.retired;
  param.namafile = params.namafile;
  
  const result = await database.seqexec(query, param,commit,conn);
  console.log(param);
  return param;
}
async function addParent(params,commit,conn) {
  let query = `insert into dbadmit.tmitpmportofolio
    (   i_porto,
        i_serv,
            n_porto_apl,
            n_porto_owner,
            c_porto_grp,
            e_porto_url,
            c_porto_status,
            n_porto_dev,
            n_porto_apltype,
            d_porto_publish,
            d_porto_retired,
            N_FILEAPPL,
        I_entry,
        d_entry
    )values(
        :idporto,
        :kodebisnis,
        :namaaplikasi,
        :namabpo,
        :kodegrup,
        :url,
        :status,
        :namadev,
        :tipeapl,
        to_date(:tglpublish,'dd/mm/yyyy'),
        to_date(:tglretired,'dd/mm/yyyy'),
        :namafile,
        :identry,
        sysdate
    )returning i_id into :id`;

  const param = {};
  param.idporto = params.kode;
  param.kodebisnis = params.cata;
  param.namaaplikasi = params.aplikasi;
  param.namabpo = params.bpo;
  param.kodegrup = params.grup;
  param.url = params.url;
  param.status = params.status;
  param.namadev = params.dev;
  param.tipeapl = params.tipe;
  param.tglpublish = params.publish === 'Invalid date'? null :params.publish ;
  param.tglretired = params.retired === 'Invalid date'? null :params.retired;
  
  param.identry = params.identry;
  param.namafile = params.namafile;
  param.id = { dir: oracledb.BIND_OUT };

  const result = await database.seqexec(query, param,commit,conn);
  param.id = result.outBinds.id[0];
  delete param.identry;
  return param;
}

async function addChild(params,commit,conn) {
  let query = `insert into dbadmit.tmitpmportofoliodtl
    (
        i_idporto,
        i_porto_item,
        n_porto_modul,
        e_porto_modul,
        c_porto_itemstat,
        d_porto_itempublish,
        d_porto_itemretired,
        i_entry,
        d_entry
    )values(
       :idproto,
       :modelnumber,
       :namamodul,
       :ketmodul,
       :statusitem,
       to_date(:tglitempublish,'dd/mm/yyyy'),
       to_date(:tglitemretired,'dd/mm/yyyy'),
       :identry,
       sysdate

    )returning i_id into :id`;

  const param = {};
  (param.idproto = params.idporto),
    (param.modelnumber = params.item),
    (param.namamodul = params.nama),
    (param.ketmodul = params.keterangan),
    (param.statusitem = params.status),
    (param.tglitempublish = params.tglitempublish),
    (param.tglitemretired = params.tglitemretired),
    (param.identry = params.identry);
  param.id = { dir: oracledb.BIND_OUT };

  const result = await database.seqexec(query, param,commit,conn);
  param.id = result.outBinds.id[0];
  delete param.identry;
  return param;
}

async function removeChild(params,commit,conn) {
  let query = `delete dbadmit.tmitpmportofoliodtl where i_idporto = :idporto`;
  const param = {}
  param.idporto = params.idporto
  const res = await database.seqexec(query, param,commit,conn);

  return res.rowsAffected;
}
async function removeParent(params,commit,conn) {
  let query = `delete dbadmit.tmitpmportofolio where i_id = :idporto`;
  const res = await database.seqexec(query, params,commit,conn);

  return res.rowsAffected;
}

async function grupporto(){
  let query=`select a.C_PORTO_GRP as kodegrup, a.N_PORTO_GRP as namagrup
  from DBADMIT.TRITPMPORTOFOLIOGRP a`

  const rest  = await database.exec(query)
  return rest.rows
}

async function kodeporto(param){
  let query=`select to_char(nvl(max(substr(i_porto,10,4))+1,1),'0000') as next from dbadmit.tmitpmportofolio 
  where substr(i_porto,15) = to_char(sysdate,'yyyy')

  `
 
  const rest = await database.exec(query)

  return rest.rows
}

module.exports.kodeporto = kodeporto;
module.exports.grupporto = grupporto
module.exports.findChild = findChild;
module.exports.findParent = findParent;
module.exports.addParent = addParent;
module.exports.addChild = addChild;
module.exports.editParent = editParent;
module.exports.removeChild = removeChild;
module.exports.removeParent = removeParent;
