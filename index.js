
const express = require('express');
const moviedetails = require('./context.js');

const app = express();

const port = parseInt(process.env
.PORT) || process.argv[3] || 8080;

app.get('/new', async (req, res) => {
  const page= req.query.page || 0;
  const results = await moviedetails('movie',`/category/new-tamil-movies-online/page/${page}/`);
  res.send(results)
});

app.get('/hd', async (req, res) => {
  const page= req.query.page || 0;
  const results = await moviedetails('movie',`/category/tamil-hd-movies/page/${page}/`);
  res.send(results)
});

app.get('/dubbed', async (req, res) => {
  const page= req.query.page || 0;
  const results = await moviedetails('movie',`/category/tamilyogi-dubbed-movies-online/page/${page}/`);
  res.send(results)
});

app.get('/series', async (req, res) => {
  const page= req.query.page || 0;
  const results = await moviedetails('tv',`/category/tamil-web-series/page/${page}/`);
  res.send(results)
});

app.get('/search', async (req, res) => {
  const moviename=req.query.moviename || "dress up"
  const page= req.query.page || 0;
  const results = await moviedetails('multi',`/page/${page}/?s=${moviename}`);
  res.send(results)
});

app.listen(port, () => {
  console.log(`Listening on http://localhost:${port}`);
});
