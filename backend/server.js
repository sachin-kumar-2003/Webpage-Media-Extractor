const express = require("express");
const axios = require("axios");
const cheerio = require("cheerio");
const cors = require("cors");

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

app.get("/scrape", async (req, res) => {
    const { url } = req.query;
    if (!url) return res.status(400).json({ error: "URL is required" });

    try {
        const { data } = await axios.get(url);
        const $ = cheerio.load(data);

        let media = [];

        // Extract images
        $("img").each((i, elem) => {
            let imgSrc = $(elem).attr("src");
            if (imgSrc && !imgSrc.startsWith("data:")) {
                if (!imgSrc.startsWith("http")) imgSrc = new URL(imgSrc, url).href;
                media.push({ type: "image", url: imgSrc });
            }
        });

        // Extract videos
        $("video source").each((i, elem) => {
            let videoSrc = $(elem).attr("src");
            if (videoSrc && !videoSrc.startsWith("http")) videoSrc = new URL(videoSrc, url).href;
            media.push({ type: "video", url: videoSrc });
        });

        // Extract embedded videos (YouTube, Vimeo, etc.)
        $("iframe").each((i, elem) => {
            let iframeSrc = $(elem).attr("src");
            if (iframeSrc && (iframeSrc.includes("youtube") || iframeSrc.includes("vimeo"))) {
                media.push({ type: "iframe", url: iframeSrc });
            }
        });

        res.json({ media });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to scrape the webpage" });
    }
});

app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
