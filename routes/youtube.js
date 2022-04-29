const express = require('express')
const ytdl = require('ytdl-core')
const cp = require('child_process');
const readline = require('readline');
const ffmpeg = require('ffmpeg-static');
const router = express.Router()

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

// This route gives All format with all other information
router.get("/full", async(req,res)=>{
	const video = convertUrl(req.query.video)
	let info = await ytdl.getInfo(video)
	let format = ytdl.filterFormats(info.formats, 'videoandaudio')
	res.json(format)
	// res.json(info)
	// res.json(info.player_response.streamingData.adaptiveFormats)
    // title and thumbnails = info.player_response.videoDetails
})

// This route gives Youtube added Audio Video files and other webm without Audio files
router.get("/all", async(req,res)=>{
	const video = convertUrl(req.query.video)
	let info = await ytdl.getInfo(video)

	let fullFormat = ytdl.filterFormats(info.formats, 'videoandaudio')
	let videoFormats = ytdl.filterFormats(info.formats, 'videoonly')

	let p720 = fullFormat.filter(a => a.qualityLabel == "720p" && a.container == "mp4")
	let p360 = fullFormat.filter(a => a.qualityLabel == "360p" && a.container == "mp4")

	let p480 = videoFormats.filter(a => a.qualityLabel == "480p" && a.container == "webm")
	let p240 = videoFormats.filter(a => a.qualityLabel == "240p" && a.container == "webm")
	let p144 = videoFormats.filter(a => a.qualityLabel == "144p" && a.container == "webm")

	let arr = {
		"720p": p720[0].url,
		"480p": p480[0].url,
		"360p": p360[0].url,
		"240p": p240[0].url,
		"144p": p144[0].url
	}

	res.json(arr)
})

// This route gives only Youtube Added Audio Format but by passing quality through query parameter
router.get("/format", async(req,res)=>{
	let quality = req.query.quality
	const video = convertUrl(req.query.video)
	let info = await ytdl.getInfo(video)
	const title = info.player_response.videoDetails.title.replace(/[^\x00-\x7F]/g, "")

	let format = ytdl.filterFormats(info.formats, 'videoandaudio')

	let formatOutput = format.filter(a => a.qualityLabel == quality && a.container == "mp4")[0].url

	res.json({ "url": formatOutput })
})

// This Route is Merging all the request Format using query parameter "video=youtube-url" and "quality=144p" for example
router.get('/merge', async (req, res)=>{
    const quality = req.query.quality
	const video = convertUrl(req.query.video)

	const info = await ytdl.getInfo(video)
	const title = info.player_response.videoDetails.title.replace(/[^\x00-\x7F]/g, "")

	res.header('Content-Disposition', `attachment; filename="${title}.mp4"`)
	res.header('Content-Type', 'video/mp4')

	// let vid = ytdl(video, {filter: format => format.qualityLabel === '480p'})
	let vid = ytdl(video, {filter: format => format.qualityLabel === quality})
	let aud = ytdl(video, { quality: 'lowestaudio' })

	const ffmpegProcess = cp.spawn(ffmpeg, [
		'-i', `pipe:3`,
		'-i', `pipe:4`,
		'-map','0:v',
		'-map','1:a',
		'-c:v', 'copy',
		'-c:a', 'libmp3lame',
		'-crf','27',
		'-preset','veryfast',
		'-movflags','frag_keyframe+empty_moov',
		'-f','mp4',
		'-loglevel','error',
		'-'
	], {
		stdio: [
		'pipe', 'pipe', 'pipe', 'pipe', 'pipe',
		],
	})
	
	vid.pipe(ffmpegProcess.stdio[3])
	aud.pipe(ffmpegProcess.stdio[4])
	ffmpegProcess.stdio[1].pipe(res)
})

// This is Route where all test are performed
router.get('/try', async (req, res)=>{
	const itag = req.query.itag
	const video = convertUrl(req.query.video)
	
	res.header('Content-Disposition', 'attachment; filename="try.mp4"');
	res.header('Content-Type', 'video/mp4')

	ytdl(video, {filter: format => format.qualityLabel === itag}).pipe(res)
	// res.send({"type": (typeof itag), "itag": itag})
})

// Below Route gives only 'webm' format which dont contain any audio
router.get("/videoonly", async(req,res)=>{
    const video = convertUrl(req.query.video)
	let info = await ytdl.getInfo(video)
	let videoFormats = ytdl.filterFormats(info.formats, 'videoonly')
	let filtered = videoFormats.filter(a => a.container == "webm")
	res.json(filtered)
})

// Below Route gives Audio of format 'm4a'
router.get("/audioonly", async(req,res)=>{
	const video = convertUrl(req.query.video)
	let info = await ytdl.getInfo(video)
	let audioFormats = ytdl.filterFormats(info.formats, 'audioonly')
	var filtered = audioFormats.filter(a => a.container == "mp4" )  // && a.audioQuality == 'AUDIO_QUALITY_LOW'
	res.json(filtered)
	// res.header("Content-Disposition", `attachment;  filename=namechanged.m4a`);
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