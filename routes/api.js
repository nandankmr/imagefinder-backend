global.fetch = require("node-fetch");
const express = require("express");
const router = require("express").Router();
const Axios = require("axios");
const Unsplash = require("unsplash-js").default;
const toJson = require("unsplash-js").toJson;
const config = require("config");

const unsplash = new Unsplash({
  accessKey: process.env.UNSPLASH_ACCESSKEY || config.get("unsplash_accessKey"),
  secret: process.env.UNSPLASH_SECRET || config.get("unsplash_secret")
});

router.get("/pixabay/", (req, res) => {
  const key = process.env.PIXABAY_KEY || config.get("pixabay_key");
  Axios.get(
    `https://pixabay.com/api/?key=${key}&q=${req.query.q}&image_type=photo&per_page=${req.query.hits}&page=${req.query.page}`
  )
    .then(r => {
      res.json(r.data.hits);
    })
    .catch(err => {
      console.log(err);
    });
});

router.get("/unsplash/", (req, res) => {
  req.query.q.trim().length
    ? unsplash.search
        .photos(req.query.q, req.query.page, req.query.hits)
        .then(toJson)
        .then(r =>
          res.json(
            r.results.map(result => {
              return {
                id: result.id,
                webformatURL: result.urls.small,
                largeImageURL: result.urls.regular,
                tags: result.tags.map(tag => tag.title).join(", "),
                user: result.user.username,
                download: result.urls.full
              };
            })
          )
        )
        .catch(err => console.log(err))
    : unsplash.photos
        .listPhotos(req.query.page, req.query.hits)
        .then(toJson)
        .then(r =>
          res.json(
            r.map(result => {
              return {
                id: result.id,
                webformatURL: result.urls.small,
                largeImageURL: result.urls.regular,
                tags: result.alt_description,
                user: result.user.username,
                download: result.urls.full
              };
            })
          )
        )
        .catch(console.log);
});

router.get("/pexels/", (req, res) => {
  const key = process.env.PEXELS_KEY || config.get("pexels_key");
  const url = req.query.q.trim().length
    ? `https://api.pexels.com/v1/search?query=${req.query.q}&per_page=${req.query.hits}&page=${req.query.page}`
    : `https://api.pexels.com/v1/curated?per_page=${req.query.hits}&page=${req.query.page}`;
  Axios.get(url, {
    headers: {
      Authorization: key
    }
  })
    .then(r =>
      res.json(
        r.data.photos.map(photo => {
          return {
            id: photo.id,
            webformatURL: photo.src.medium,
            largeImageURL: photo.src.large2x,
            tags: "",
            user: photo.photographer,
            download: photo.src.original
          };
        })
      )
    )
    .catch(err => console.log(err));
});

router.get("/giphy/", (req, res) => {
  const key = process.env.GIPHY_KEY || config.get("giphy_key");
  let params = req.query.q.trim().length
    ? `/search?api_key=${key}&q=${req.query.q}&limit=${
        req.query.hits
      }&offset=${(req.query.page - 1) * req.query.hits}`
    : `/trending?api_key=${key}&limit=${req.query.hits}&offset=${(req.query
        .page -
        1) *
        req.query.hits}`;

  Axios.get(`https://api.giphy.com/v1/gifs${params}`)
    .then(r =>
      res.json(
        r.data.data.map(gif => {
          return {
            id: gif.id,
            webformatURL: gif.images.fixed_width_downsampled.url,
            largeImageURL: gif.images.original.url,
            tags: gif.title.split("GIF")[0],
            user: gif.username,
            original: gif
          };
        })
      )
    )
    .catch(err => console.log(err));
});

module.exports = router;
