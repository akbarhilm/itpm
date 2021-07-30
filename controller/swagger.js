const express = require('express');
const router = express.Router();
const profil = require("../swaggerprofil.json")
const proyek = require("../swaggerproyek.json")
router.get('/v2/profil', async (req, res, next) => {
    try {
       
        
            res.status(200).send(profil);
      
    } catch (err) {
        console.error(err)
        next(err)
    }
})

router.get('/v2/proyek', async (req, res, next) => {
    try {
       
        
            res.status(200).send(proyek);
      
    } catch (err) {
        console.error(err)
        next(err)
    }
})

module.exports = router