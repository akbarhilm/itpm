const express = require('express');
const router = express.Router();
const cookie = require('cookie')
router.get('/',(req,res,next)=>{
    try{
        res
        .setHeader('Set-Cookie', cookie.serialize('token',req.query.token,{
            httpOnly:true,
            secure:false
        }))
        return  res.status(200).send('OK')
    }catch(err){
        console.error(err)
        next(err)
    }
})

module.exports = router