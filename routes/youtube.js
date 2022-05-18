const express = require('express')
const ytdl = require('ytdl-core')
const cp = require('child_process')
const ffmpeg = require('ffmpeg-static')
const router = express.Router()
const { v4: uuidv4 } = require('uuid')
const ytpl = require('ytpl')
const fs = require('fs')


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

let tempName = uuidv4()

// let full ='https://www.youtube.com/watch?v=p8NrTxybc6c'
// let small = 'https://youtu.be/p8NrTxybc6c'
// let short = 'https://www.youtube.com/shorts/NurNN_g1rZM'

// This route give Playlist's Videos
router.get('/playlist', async(req, res) => {
	// const video = convertUrl(req.query.video)
	const playlist = await ytpl("https://www.youtube.com/playlist?list=PLu0W_9lII9agtWvR_TZdb_r0dNI8-lDwG")
	res.send(playlist)
})

// This route gives All format with all other information
router.get("/full", async(req,res)=>{
	const video = convertUrl(req.query.video)
	let info = await ytdl.getInfo(video)
	let formats = ytdl.filterFormats(info.formats, 'videoandaudio')
	let vidInfo = info.player_response.videoDetails // Array

	let vidFormats = ytdl.filterFormats(info.formats, 'videoonly').filter(a => a.container == "webm")
	let audFormats = ytdl.filterFormats(info.formats, 'audioonly').filter(a => a.container == "mp4" )[0].url

	let title = vidInfo.title.replace(/[^\x00-\x7F]/g, "") // String
	let thumbnails = vidInfo.thumbnail.thumbnails // Array
	
	let arr = []
	let onlyFormats = []
	let ytVid =[]
	let vidObj = {}

	try {
		formats.map((i) => {
			vidObj = {};
			vidObj[i["qualityLabel"]] = i.url;
			ytVid.push(vidObj);
		})
		vidFormats.map((i) => {
			onlyFormats.push(i.qualityLabel)
		})
		arr.push({ "title": title }, { "thumbnails": thumbnails }, { "formats": onlyFormats }, { "ytVid": ytVid }, { "ytAudio": audFormats })
		res.json(arr)
	} catch (error) { res.json({"error": error}) }

	// res.json(info.player_response.streamingData.adaptiveFormats)
    // title and thumbnails = info.player_response.videoDetails
})

// This route gives Youtube added Audio Video files
router.get("/all", async(req,res)=>{
	const video = convertUrl(req.query.video)
	let info = await ytdl.getInfo(video)
	let format = ytdl.filterFormats(info.formats, 'videoandaudio')
	res.json(format)
})

// This route gives info of all available formats in array
router.get("/quality", async(req,res)=>{
	const video = convertUrl(req.query.video)
	let info = await ytdl.getInfo(video)
	let format = ytdl.filterFormats(info.formats, 'videoonly')
	let vidQualities = format.filter(a => a.container == "webm")

	let arr = []
	for(let i=0; i < vidQualities.length; i++){
		arr.push(vidQualities[i].qualityLabel)
	}
	
	res.json(arr)
})

// This route gives only Youtube Added Audio Format but by passing quality through query parameter
router.get("/format", async(req,res)=>{
	let quality = req.query.quality
	const video = convertUrl(req.query.video)
	let info = await ytdl.getInfo(video)
	let title = info.player_response.videoDetails.title.replace(/[^\x00-\x7F]/g, "")

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

// This is Route merged Video's quality is improved
router.get('/merge1', async (req, res)=>{
    const quality = req.query.quality
	const video = convertUrl(req.query.video)

	// let video = "https://www.youtube.com/watch?v=0pYlJ7hA5Zo"

	// const info = await ytdl.getInfo(video)
	// const title = info.player_response.videoDetails.title.replace(/[^\x00-\x7F]/g, "")

	// res.header('Content-Disposition', `attachment; filename="${title}.mp4"`)
	// res.header('Content-Type', 'video/mp4')

	let vid = ytdl(video, {filter: format => format.qualityLabel === quality})
	let aud = ytdl(video, { quality: 'lowestaudio' })

	const ffmpegProcess = cp.spawn(ffmpeg, [
		'-loglevel', '8', '-hide_banner',
		'-progress', 'pipe:3',
		'-i', 'pipe:4',
		'-i', 'pipe:5',
		'-map', '0:a',
		'-map', '1:v',
		'-c:v', 'copy',
		`./temp/${tempName}.mp4`,
	], {
		windowsHide: true,
		stdio: [
			'inherit', 'inherit', 'inherit',
			'pipe', 'pipe', 'pipe',
		],
	})
	ffmpegProcess.on('close', () => {
		let mediaUrl;
		if(process.env.NODE_ENV !== 'production'){
			mediaUrl = `http://localhost:3000/media/${tempName}.mp4`
		}else{
			mediaUrl = `http://api-server-by-dc.herokuapp.com/media/${tempName}.mp4`
		}
		res.redirect(mediaUrl)
		
		// let mediaUrl = `http://localhost:3000/media/${tempName}.mp4`
		// res.send(`Merging Completed. Video URL is:  <a href=${mediaUrl} target="_blank">Click Here</a>`)

		setTimeout(() => {
			fs.unlink("./temp/" + `${tempName}.mp4`, (err) => { if (err) throw err })
		}, 60000) // 1 Minute

	})
	ffmpegProcess.on('error', (e) => {
		res.json({ "error": e })
	})

	aud.pipe(ffmpegProcess.stdio[4])
	vid.pipe(ffmpegProcess.stdio[5])

})

// This is try Route
router.get('try', async (req,res)=>{
	res.send('Try')
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
	const info = await ytdl.getInfo(video)
	let formats = ytdl.filterFormats(info.formats, 'audioonly')
	var filtered = formats.filter(a => a.container == "mp4" )
	res.json(filtered)
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