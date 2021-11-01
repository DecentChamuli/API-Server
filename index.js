const express = require('express')
const cors = require('cors')
const PORT = process.env.PORT || 5000
require('dotenv').config()

const app = express()

// Routes
app.use('/api', require('./routes'))

app.use(cors())

app.listen(PORT, ()=> console.log(`Server running on port http://localhost:${PORT}`))

