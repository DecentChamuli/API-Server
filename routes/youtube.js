const express = require('express')
const ytdl = require('ytdl-core')
const router = express.Router()
const avd = require("all-video-downloader");

const convertUrl = (url) => {
    let newUrlArray;
    if(url.includes("youtu.be")){
        newUrlArray = url.split("youtu.be/")
        return `https://www.youtube.com/watch?v=${newUrlArray[1]}`
    }
    else if(url.includes("www.youtube.com/shorts/")){
        newUrlArray = url.split("www.youtube.com/shorts/")
        return `https://www.youtube.com/watch?v=${newUrlArray[1]}`
    }
    else if(url.includes("www.youtube.com/watch?v")){
        return url
    }
    else{
        return 'https://www.youtube.com/watch?v=p8NrTxybc6c'
    }
}

// let full ='https://www.youtube.com/watch?v=p8NrTxybc6c'
// let small = 'https://youtu.be/p8NrTxybc6c'
// let short = 'https://www.youtube.com/shorts/NurNN_g1rZM'

// https://www.npmjs.com/package/all-video-downloader
router.get("/avd", async(req,res)=>{
	const video = convertUrl(req.query.video,res)
	avd(video).then((result)=>{
		res.json(result)
	})
})


// router.get("/video", async(req,res)=>{
// 	const video = convertUrl(req.query.video,res)
// 	let info = await ytdl.getInfo(video)
// 	res.json(info)
// 	// res.json(info.player_response.streamingData.adaptiveFormats)
//     // title and thumbnails = info.player_response.videoDetails
// })

// Below Route gives only 'webm' format which dont contain any audio
router.get("/video1", async(req,res)=>{
    const video = convertUrl(req.query.video,res)
	let info = await ytdl.getInfo(video)
	let videoFormats = ytdl.filterFormats(info.formats, 'videoonly')
	let filtered = videoFormats.filter(a => a.container == "webm")
	res.json(filtered)
})

// Below Route gives Audio of format 'm4a'
router.get("/audio", async(req,res)=>{
	const video = convertUrl(req.query.video)
	let info = await ytdl.getInfo(video)
	let audioFormats = ytdl.filterFormats(info.formats, 'audioonly')
	var filtered = audioFormats.filter(a => a.container == "mp4" )  // && a.audioQuality == 'AUDIO_QUALITY_LOW'
	res.json(filtered)
	// res.json(audioFormats)
})

router.get('/download', async (req,res) => {
    const {itag,title,type} = req.query
	const video = convertUrl(req.query.video)

	if(type === "mp4"){
		res.header('Content-Disposition', `attachment; filename="${title}.mp4"`);
		res.header('Content-Type', 'video/mp4');
	}else if(type === "mp3"){
		res.header('Content-Disposition', `attachment; filename="${title}.mp3"`);
		res.header('Content-Type', 'audio/mp3');
	}
	ytdl(video, { filter: format => format.itag === parseInt(itag) }).pipe(res);
})


module.exports = router