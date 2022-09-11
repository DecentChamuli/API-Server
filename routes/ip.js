const express = require('express')
const router = express.Router()
const apicache = require('apicache')
const axios = require('axios')

// Environment Variables
const IP_API_KEY = process.env.IP_API_KEY

// Initialize Cache
let cache = apicache.middleware

router.get('/', cache('30 minutes'), async (req,res) => {
    try {
        const base_url = 'https://ipinfo.io'

        // const apiRes = await needle('get', `${base_url}?token=${IP_API_KEY}`)
        const apiRes = await axios.get(`${base_url}?token=${IP_API_KEY}`)

        res.status(200).json(apiRes.data)
        
    } catch (error) {
        res.status(500).json({error})  
    }
})

module.exports = router