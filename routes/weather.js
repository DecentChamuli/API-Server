const express = require('express')
const router = express.Router()
const apicache = require('apicache')
const axios = require('axios')

// Environment Variables
const WEATHER_API_KEY = process.env.WEATHER_API_KEY

// Initialize Cache
let cache = apicache.middleware

router.get('/', cache('1 minutes'), async (req,res) => {
    try {    
        if(req.query.q){
            const base_url = 'https://api.openweathermap.org/data/2.5/weather'
            const apiRes = await axios.get(`${base_url}?appid=${WEATHER_API_KEY}&units=metric&q=${req.query.q}`)
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