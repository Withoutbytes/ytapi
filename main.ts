import ytdl from "ytdl-core";
import yts from "yt-search";
import express from "express";
const app = express();

app.use(express.query({}))

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

app.get("/music/play", async (req, res) => {
    const { videoId } = req.query;
    if (typeof videoId != "string") return res.status(400).send("Missing video query param");
    try {
        const info = await ytdl.getBasicInfo(videoId);

        ytdl(videoId, {
            filter: format => format.container === 'mp4',
            // quality: "140",
        }).pipe(res);
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

