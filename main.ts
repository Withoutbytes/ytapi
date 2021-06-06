import ytdl from "ytdl-core";
import yts from "yt-search";
import express from "express";
const app = express();

app.use(express.query({}));

interface IFormat {
    itag: number;
    url: string;
    mimeType: string;
    bitrate: number;
    width: number;
    height: number;
    lastModified: string;
    contentLength: string;
    quality: string;
    fps: number;
    qualityLabel: string;
    projectionType: string;
    averageBitrate: number;
    audioQuality: string;
    approxDurationMs: string;
    audioSampleRate: string;
    audioChannels: number;
}

app.get("/music", async (req, res) => {
    const { query } = req.query;
    console.log({ query });

    if (typeof query != "string") return res.status(400).send("Missing video query param");
    try {
        const qRes = await yts(query);
        const videoId = qRes.videos[0].videoId;
        if (!videoId) return res.status(404).send("video not found");
        console.log(qRes.videos[0].title);
        res.setHeader("Content-Type", "video/mp4");
        ytdl(videoId, {
            filter: format => format.container === 'mp4',
            // quality: "140",
            // filter: 'audioonly',
            quality: "lowest"
        }).pipe(res);
    } catch (e) {
        const error = e as Error;
        res.status(500).send(error?.message);
    }
});

// app.get("/music/play", async (req, res) => {
//     const { videoId } = req.query;
//     if (typeof videoId != "string") return res.status(400).send("Missing video query param");
//     try {
//         const info = await ytdl.getBasicInfo(videoId);

//         ytdl(videoId, {
//             filter: format => format.container === 'mp4',
//             // quality: "140",
//         }).pipe(res);
//     } catch (e) {
//         const error = e as Error;
//         res.status(500).send(error?.message);
//     }
// });

app.get("/music/url", async (req, res) => {
    const { videoId } = req.query;
    if (typeof videoId != "string") return res.status(400).send("Missing video query param");
    try {
        const info = await ytdl.getBasicInfo(videoId);

        const videos = (info.player_response.streamingData.formats as IFormat[])
            .filter(f => f.mimeType.includes("video/mp4; "));
        if (!videos) return res.status(404).send("Video not found");

        res.send({ videoUrl: videos[0].url, videos: videos.map(v => v.url) });

    } catch (e) {
        const error = e as Error;
        res.status(500).send(error?.message);
    }
});

app.get("/music/search", async (req, res) => {
    const { query } = req.query;
    if (typeof query != "string") return res.status(400).send("Missing video query param");
    try {
        const qRes = await yts(query);
        const video = qRes.videos[0];
        if (!video) return res.status(404).send("video not found");
        res.send({ videoId: video.videoId, title: video.title });
    } catch (e) {
        const error = e as Error;
        res.status(500).send(error?.message);
    }
})
const port = process.env.PORT || 8083;
app.listen(port, () => console.log(`Server at http://localhost:${port}`));

