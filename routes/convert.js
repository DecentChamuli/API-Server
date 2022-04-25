const express = require('express')
const fluent = require('fluent-ffmpeg')
const router = express.Router()

router.get('/', async (req,res) =>{
    res.send('Convert')
})



module.exports = router