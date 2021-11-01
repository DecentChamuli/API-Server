const express = require('express')
const router = express.Router()
const needle = require('needle')
const url = require('url')

// Env Variables
const WEATHER_API_BASE_URL = process.env.WEATHER_API_BASE_URL
const WEATHER_API_KEY_NAME = process.env.WEATHER_API_KEY_NAME
const WEATHER_API_KEY_VALUE = process.env.WEATHER_API_KEY_VALUE

router.get('/', async (req,res) => {
    try {
        const params = new URLSearchParams({
            [WEATHER_API_KEY_NAME]: WEATHER_API_KEY_VALUE,
            ...url.parse(req.url, true).query
        })

        const apiRes = await needle('get', `${WEATHER_API_BASE_URL}?${params}`)
        const data = apiRes.body
        
        // Log request if not in Production 
        
        // if(process.env.NODE_ENV !== 'production'){
        //     console.log(`REQUEST: ${WEATHER_API_BASE_URL}?${params}`)
        // }

        res.status(200).json({data})        
        
    } catch (error) {
        res.status(500).json({error})        
    }

})

module.exports = router