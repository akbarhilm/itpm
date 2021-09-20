const database = require('../conf/db/db')
const oracledb = require('oracledb');
const axios = require('axios')



function  mail(params){
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


    axios
    .post('http://10.1.94.235:8025/send', postData,
    {headers: {
        // Overwrite Axios's automatically set Content-Type
        'Content-Type': 'application/json'
      }
    })
    .then(res => {
     // resp.status(200).json(
      // res.data
     //)

      console.dir(res.data)
      return res.data
    })
    .catch(error => {
      console.error(error)
    })
  
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