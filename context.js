const url = 'https://tamilyogi.beer';
const puppeteer = require('puppeteer');
const axios = require('axios');
const cheerio = require('cheerio');
const userAgent = "Mozilla/5.0 (iPad; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Version/15.0 Safari/605.1.15 AlohaBrowser/3.2.6";
const tmdbKey = '29b2cbf670744151d048be945087dfb5';
const start = require('./videolinks');

async function videolinks(url) {
    try {
        const axiosResponse = await axios.request({
            method: "GET",
            url: url,
            headers: {
                "User-Agent": userAgent,
            },
        });
        const $ = cheerio.load(axiosResponse.data);
        const linkElement = $(".rez iframe");
        const videoLink = linkElement.attr("src");
       
        if(videoLink.includes('.html')){
            const quality = await start(videoLink);
            return quality;
        }else{
            const identifier = url.split('?')[1];
            const newvideoLink = `https://vidplay.one/embed-${identifier}.html`;
            const quality = await start(newvideoLink);
            return quality;
        }

    } catch (error) {
        console.error("Error fetching video link from:", url, error.message);
        return null;
    }
}

async function scrapeContentPage(url) {
    try {
        const axiosResponse = await axios.request({
            method: "GET",
            url: url,
            headers: {
                "User-Agent": userAgent,
            },
        });
        const $ = cheerio.load(axiosResponse.data);
        const links = [];

        const linkElements = $('.rez a').toArray();

        if (linkElements.length === 0) {
            const quality = await videolinks(url);
            if (quality) {
                return [{ title: 'Direct video', quality }];
            }
            return [];
        } else {
            const linkPromises = linkElements.map(async (element) => {
                const href = $(element).attr('href');
                const title = $(element).text();
                const quality = await videolinks(href);
                return { title, quality};
            });

            const results = await Promise.all(linkPromises);
            links.push(...results);
            return links;
        }

    } catch (error) {
        console.error("Error fetching content page:", url, error.message);
        return null;
    }
}

async function fetchTmdbData(media, title) {
    try {
        const tmdbResponse = await axios.get(`https://api.themoviedb.org/3/search/${media}?api_key=${tmdbKey}&query=${title.split(' – ')[0]}`);
        return tmdbResponse.data.results[0] || null;
    } catch (error) {
        console.error(`Error fetching TMDB data for title: ${title}`, error.message);
        return null;
    }
}

async function moviedetail(media, link) {
    const titles = [];
    try {
        const axiosResponse = await axios.request({
            method: "GET",
            url: `${url}${link}`,
            headers: {
                "User-Agent": userAgent,
            },
        });

        const $ = cheerio.load(axiosResponse.data);
        if(link.includes('?s=')){
            posts = $('#post-results a.loop-link');
        }else{
            posts = $('.post a.loop-link');
        } 
        for (let i = 0; i < posts.length; i++) {
            const post = posts[i];
            const title = $(post).find('.post-title').text().split('(')[0].trim();
            const def = $(post).attr('href');
            const backdrop = $(post).find('img').attr('src');

            // Fetch content data (video links)
            const videolink = await scrapeContentPage(def);
            // Fetch TMDB data
            const tmdbMovie = await fetchTmdbData(media, title);

            if (tmdbMovie) {
                const orignaltitle = tmdbMovie.title||tmdbMovie.name;
                const poster = `https://image.tmdb.org/t/p/w500${tmdbMovie.poster_path}`;
                const overview = tmdbMovie.overview;
                const releasedate = tmdbMovie.release_date||tmdbMovie.first_air_date;
                const rating = tmdbMovie.vote_average;

                titles.push({
                    title,
                    orignaltitle,
                    poster,
                    backdrop,
                    overview,
                    releasedate,
                    rating,
                    videolink,
                });
            } else {
                titles.push({
                    title,
                    orignaltitle: null,
                    poster: null,
                    backdrop,
                    overview: 'No Overview Available.',
                    releasedate: 'No Release Date Available.',
                    rating: 0,
                    videolink,
                });
            }
        }

        return titles;

    } catch (error) {
        console.error("Error fetching content page:", url, error.message);
        return [];
    }
}

module.exports = moviedetail;
