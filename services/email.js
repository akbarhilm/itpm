// const express = require('express');
// const router = express.Router();
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
module.exports.mail = mail

//module.exports = router