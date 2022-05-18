const express = require('express')
const cors = require('cors')
const path = require('path')
const rateLimit = require('express-rate-limit')
const PORT = process.env.PORT || 3000
const fs = require('fs')
require('dotenv').config()

const app = express()

// Rate Limit
const limiter = rateLimit({
    windowMs: 5 * 60 * 1000, // 10 Mins
    max: 50
})
app.use(limiter)
app.set('trust proxy', 1)

// app.use(express.static('tmp'))
// app.use(express.static('files'))

app.use('/media', express.static('temp'))

app.use(cors())

// List of All Routes
app.get('/', (req,res) => {
  res.sendFile(path.join(__dirname, 'index.html'))
})

// Delete Files placed in Temp Folder
app.get('/delete', (req, res) => {
  let {fileName} = req.query
  fs.unlink("./temp/" + `${fileName}`, err => {
    if (err) throw err;
  })
  res.send(`${fileName} Deleted Successfully.`)
})

// List Down all Files present in Temp folder
app.get('/allmedia', (req,res) => {

  let arr = []

  fs.readdirSync('./temp/').forEach(file => {
    arr.push(file)
  });
  res.send(arr)

  // res.sendFile(path.join(__dirname, './temp/file.txt'))
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

app.listen(PORT, ()=> {
    if(process.env.NODE_ENV !== 'production')
        console.log(`Server running on http://localhost:${PORT}`)
})