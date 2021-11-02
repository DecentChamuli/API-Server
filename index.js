const express = require('express')
const cors = require('cors')
const rateLimit = require('express-rate-limit')
const PORT = process.env.PORT || 3000
require('dotenv').config()

const app = express()

// Rate Limit
const limiter = rateLimit({
    windowMs: 10 * 60 * 1000, // 10 Mins
    max: 10
})
app.use(limiter)
app.set('trust proxy', 1)

// Routes
// app.use('/', (req, res) => {
//     res.send('<h1><a href="/api">Weather</a></h1>')
// })

// app.use('/api', require('./routes'))
app.use('/', require('./routes'))

app.use(
    cors({
        origin: ["http://localhost", "127.0.0.1"],
        methods: ["GET"]
    })
)

app.listen(PORT, ()=> {
    if(process.env.NODE_ENV !== 'production'){
        console.log(`Server running on http://localhost:${PORT}`)
    }
})

