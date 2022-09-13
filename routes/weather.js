const express = require('express')
const router = express.Router()
const apicache = require('apicache')
const axios = require('axios')

// Environment Variables
const WEATHER_API_KEY_v1 = process.env.WEATHER_API_KEY_v1
const WEATHER_API_KEY_v2 = process.env.WEATHER_API_KEY_v2

// Initialize Cache
let cache = apicache.middleware

router.get('/v1', cache('5 minutes'), async (req,res) => {
    try {    
        if(req.query.q){
            const base_url = 'https://api.openweathermap.org/data/2.5/weather'
            const apiRes = await axios.get(`${base_url}?appid=${WEATHER_API_KEY_v1}&units=metric&q=${req.query.q}`)
            res.status(200).json(apiRes.data)
        }
        else{
            res.status(400).send({error: "Parameter is required"})
        }

    } catch (error) {
        res.status(500).json(error.message)
    }
})
router.get('/v2', cache('5 minutes'), async (req,res) => {
    try {    
        if(req.query.q && req.query.unit){
            // unit == 'metric' or 'us'
            const base_url = `https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/${req.query.q}?unitGroup=${req.query.unit}&key=${WEATHER_API_KEY_v2}&contentType=json`
            const apiRes = await axios.get(base_url)
            res.status(200).json(apiRes.data)
        }
        else{
            res.status(400).send({error: "Parameter is required"})
        }

    } catch (error) {
        res.status(500).json(error.message)
    }
})

module.exports = router