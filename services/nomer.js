const database = require('../conf/db/db')

async function getNomer(param,conn) {

    let code =''

    switch (param.table) {
       
        case 'ureq':
            code = 'REQ'
            break;
        case 'planreal':
            code = 'PLN'
            break;
        case 'othrresrc':
            code = 'KSD'
            break;
        case 'risk':
            code = 'RSM'
            break;
        default:
            break;
    }

    let query=`select trim(to_char(nvl(nomer,'1'),'000'))||'/${code}/IT0000/'||to_char(sysdate,'mm')||'/'||to_char(sysdate,'yyyy') as nomer from(
        select trim(to_char(max(substr(i_itpm_${param.field}nbr ,0,3))+1,'000')) as nomer from dbadmit.tmitpmproj where substr(i_itpm_${param.field}nbr,-4) = to_char(sysdate,'yyyy')
        )
`
        const result = await database.seqexec(query,[],[],conn)
        return result.rows[0]

}

module.exports.getNomer = getNomer