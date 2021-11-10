const database = require('../conf/db/db')
const oracledb = require('oracledb');
const axios = require('axios')



async function  mail(params){
var postData = JSON.stringify(params)
    // {
    //     "cc": [
    //       "test1",
    //       "test2"
    //     ],
    //     "code": "addproyek",
    //     "to": [
    //       {
    //         "email": "admin",
    //         "proyek": "Proyek XXX",
    //         "role": "PM"
    //       }
    //     ]
    //   }
    console.dir("masuk mail")
console.dir(process.env.ITPM_MAIL)
try{
    const res = await axios
    //.post('http://10.1.94.235:8025/send', postData,
    .post(process.env.ITPM_MAIL, postData,
    {headers: {
        // Overwrite Axios's automatically set Content-Type
        'Content-Type': 'application/json'
      }
    })
    // .then(res => {
    //  // resp.status(200).json(
    //   // res.data
    //  //)

    //   console.dir(res.data)
    //    res.data;
    // })
    
  return res
}catch(e){
  return e
}
}

async function getmail(params){
  let query='select i_emp_email as email from dbadmit.tritpmuser where i_emp = :nik'

  const param = {}
  param.nik = params.nik

  const result = await database.exec(query,param)
  return result.rows;
}
module.exports.mail = mail
module.exports.getmail = getmail
//module.exports = router