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

// List Down all Files present in Temp folder
app.get('/allmedia', (req,res) => {

  let arr = []

  fs.readdirSync('./temp/').forEach(file => {
    arr.push(file)
  });
  res.send(arr)

  // res.sendFile(path.join(__dirname, './temp/file.txt'))

  // setTimeout(()=>{
  //   fs.unlink("./temp/" + "a6ddf0bd-e436-41f1-9f0e-7ad95fb78c64.mp4", (err) => {
  //     if (err) throw err;
  //   })}, 5000)
  // res.send('done')

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