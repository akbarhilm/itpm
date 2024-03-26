const express = require('express');
const router = express.Router();
const cata = require('../services/catalog');
const map = require('../util/errorHandling')
const oracle = require("oracledb");

router.get('/cata/combocat',async(req,res,next)=>{
    try{
        const rest = await cata.combocat()
        console.log(rest);
        res.status(200).json(rest)
    }catch(e){
        console.error(e)
        next(e)
    }
})

module.exports = router