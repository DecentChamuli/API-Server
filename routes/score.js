const express = require('express')
const router = express.Router()
const axios = require('axios')
const cheerio = require('cheerio')

router.get('/', async (req,res) => {

        const link = 'https://www.espncricinfo.com'

        axios(link).then(response => {
            const html = response.data
            const $ = cheerio.load(html)
            const articles = []

            $('.scorecard-container', html).each(function(){
                const title = $(this).text()
                const url = link + $(this).find('a').attr('href')
                articles.push({
                    id: articles.length + 1,
                    title,
                    url
                })
            })
            res.json(articles)
        }).catch(err => {res.send('Something went wrong'); console.log(err)})

})

module.exports = router