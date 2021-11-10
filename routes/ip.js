const express = require('express')
const router = express.Router()
const needle = require('needle')
const apicache = require('apicache')

// Environment Variables
const IP_API_KEY = process.env.IP_API_KEY

// Initialize Cache
let cache = apicache.middleware

router.get('/', cache('30 minutes'), async (req,res) => {
    try {
        const base_url = 'https://ipinfo.io'

        const apiRes = await needle('get', `${base_url}?token=${IP_API_KEY}`)
        const data = apiRes.body

        res.status(200).json({data})
        
    } catch (error) {
        res.status(500).json({error})  
    }
})

module.exports = router