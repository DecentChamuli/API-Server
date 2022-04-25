const express = require('express')
const cors = require('cors')
const path = require('path')
const rateLimit = require('express-rate-limit')
const PORT = process.env.PORT || 3000
require('dotenv').config()

const app = express()

// Rate Limit
const limiter = rateLimit({
    windowMs: 5 * 60 * 1000, // 10 Mins
    max: 10
})
app.use(limiter)
app.set('trust proxy', 1)

// List of All Routes
app.get('/', (req,res) => {
  res.sendFile(path.join(__dirname, 'index.html'))
})

// Youtube Video Downloader
app.use('/yt', require('./routes/youtube'))

// File Convertor 
app.use('/convert', require('./routes/convert'))

// Weather API
app.use('/weather', require('./routes/weather'))

// IP API
app.use('/ip', require('./routes/ip'))

// Scrape API
app.use('/score', require('./routes/score'))

app.use(
    cors({
        origin: ["http://localhost", "127.0.0.1"],
        methods: ["GET"]
    })
)

app.listen(PORT, ()=> {
    if(process.env.NODE_ENV !== 'production')
        console.log(`Server running on http://localhost:${PORT}`)
})