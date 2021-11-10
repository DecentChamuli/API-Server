const express = require('express')
const router = express.Router()
const needle = require('needle')
const url = require('url')
const apicache = require('apicache')

// Environment Variables
const WEATHER_API_KEY = process.env.WEATHER_API_KEY

// Initialize Cache
let cache = apicache.middleware

router.get('/', cache('1 minutes'), async (req,res) => {
    try {    
        const params = new URLSearchParams({
            appid: WEATHER_API_KEY,
            units: 'metric',
            q: 'karachi',
            ...url.parse(req.url, true).query
        })

        const base_url = 'https://api.openweathermap.org/data/2.5/weather'

        const apiRes = await needle('get', `${base_url}?${params}`)
        const data = apiRes.body

        res.status(200).json({data})
        
    } catch (error) {
        res.status(500).json({error})  
    }
})

module.exports = router