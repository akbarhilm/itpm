const express = require('express');
const router = express.Router();
const cookie = require('cookie')
router.post('/set',(req,res,next)=>{
    try{
        console.log("asd")
        res
        .setHeader('Set-Cookie', cookie.serialize('token',req.body,{
            httpOnly:true,
            secure:false,
            path:'/'
            
            
        }))
        return  res.status(200).send('OK')
    }catch(err){
        console.error(err)
        next(err)
    }
})

router.get('/unset',(req,res,next)=>{
    try{
       
        res
        .setHeader('Set-Cookie', cookie.serialize('token',null,{
            httpOnly:true,
            secure:false,
            path:'/',
            maxAge: Date.now(0)
        }))
        return  res.status(200).send('OK')
    }catch(err){
        console.error(err)
        next(err)
    }
})

module.exports = router