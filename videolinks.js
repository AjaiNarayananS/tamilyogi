const axios = require('axios');
const cheerio = require('cheerio');

const userAgent = "Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148";

async function start(url) {
    url = url.replace("embed7", "embed");
    url = url.replace("embed8", "embed");
    const axiosResponse = await axios.request({
        method: "GET",
        url: url,
        headers: {
            "User-Agent": userAgent,
        }
    });

    const htmlContent = axiosResponse.data;
    const $ = cheerio.load(htmlContent);

    const downloadLinksObj = {};

    $('.download_links').each((_, element) => {
        const resolution = $(element).text().trim();
        const href = $(element).attr('href');
        if (resolution && href) {
            downloadLinksObj[resolution.split(" ")[0]] = href;
        }
    });
    return downloadLinksObj
}
// start('https://vidplay.one/embed7-twh36a8d0n2e.html')
module.exports =start
