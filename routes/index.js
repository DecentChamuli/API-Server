const express = require('express')
const router = express.Router()
const needle = require('needle')
const url = require('url')
const apicache = require('apicache')
// const fetch = require("node-fetch");

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
        const IPurl = 'https://ipinfo.io/?token=8488bdb1e6cd70'
        let IPapiRes = await needle('get', `${IPurl}`)
        let IPdata = IPapiRes.body.city
        // console.log(IPdata)
        
        const params = new URLSearchParams({
            [WEATHER_API_KEY_NAME]: WEATHER_API_KEY_VALUE,
            [WEATHER_API_UNIT_NAME]: WEATHER_API_UNIT_VALUE,
            // q: 'windsor',
            q: IPdata,
            ...url.parse(req.url, true).query
        })

        const apiRes = await needle('get', `${WEATHER_API_BASE_URL}?${params}`)
        const data = apiRes.body
        
        // if(process.env.NODE_ENV !== 'production'){
        //     console.log(`REQUEST: ${WEATHER_API_BASE_URL}?${params}`)
        // }

        res.status(200).json({data})        
        
    } catch (error) {
        res.status(500).json({error})        
    }

})

module.exports = router