const express = require('express')
const router = express.Router()
const needle = require('needle')
const url = require('url')
const apicache = require('apicache')

// Env Variables
const WEATHER_API_BASE_URL = process.env.WEATHER_API_BASE_URL
const WEATHER_API_KEY_NAME = process.env.WEATHER_API_KEY_NAME
const WEATHER_API_KEY_VALUE = process.env.WEATHER_API_KEY_VALUE
const WEATHER_API_UNIT_NAME = process.env.WEATHER_API_UNIT_NAME 
const WEATHER_API_UNIT_VALUE = process.env.WEATHER_API_UNIT_VALUE

// Initialize Cache
let cache = apicache.middleware

router.get('/', cache('1 minutes'), async (req,res) => {
    try {    
        const params = new URLSearchParams({
            [WEATHER_API_KEY_NAME]: WEATHER_API_KEY_VALUE,
            [WEATHER_API_UNIT_NAME]: WEATHER_API_UNIT_VALUE,
            q: 'windsor',
            ...url.parse(req.url, true).query
        })

        const apiRes = await needle('get', `${WEATHER_API_BASE_URL}?${params}`)
        const data = apiRes.body

        res.status(200).json({data})        
        
    } catch (error) {
        res.status(500).json({error})  
        console.log(error)      
    }

})

module.exports = router