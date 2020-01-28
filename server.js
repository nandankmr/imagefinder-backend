global.fetch = require("node-fetch");
const express = require("express");
const Unsplash = require("unsplash-js").default;
const toJson = require("unsplash-js").toJson;
const cors = require("cors");
const Axios = require("axios");

const unsplash = new Unsplash({
  accessKey: "43a34599b87ce29fc3d8d6a31114faa1f3f36673ead3e8a6e801e0c0e1bdd33b",
  secret: "15578c77d0daa73bc5568f90ecbcaa279b5821fd229db90439dca21063efae94"
});

const app = express();
app.use(cors());

const PORT = process.env.PORT || 5000;

app.get("/pixabay/", (req, res) => {
  const key = "14838845-97aff471166809fe19bd2c3a9";
  Axios.get(
    `https://pixabay.com/api/?key=${key}&q=${req.query.q}&image_type=photo&per_page=${req.query.hits}`
  )
    .then(r => {
      res.json(r.data.hits);
    })
    .catch(err => {
      console.log(err);
    });
});

app.get("/unsplash/", (req, res) => {
  req.query.q.trim().length
    ? unsplash.search
        .photos(req.query.q, 1, req.query.hits)
        .then(toJson)
        .then(r =>
          res.json(
            r.results.map(result => {
              return {
                id: result.id,
                webformatURL: result.urls.thumb,
                largeImageURL: result.urls.regular,
                tags: result.tags.map(tag => tag.title).join(", "),
                user: result.user.username
              };
            })
          )
        )
        .catch(err => console.log(err))
    : unsplash.photos
        .listPhotos(1, req.query.hits)
        .then(toJson)
        .then(r =>
          res.json(
            r.map(result => {
              return {
                id: result.id,
                webformatURL: result.urls.thumb,
                largeImageURL: result.urls.regular,
                tags: result.alt_description,
                user: result.user.username
              };
            })
          )
        )
        .catch(err => console.log(err));
});

app.get("/pexels/", (req, res) => {
  const key = "563492ad6f91700001000001a9f0594f242f471d818ad306d874f5a7";
  const url = req.query.q.trim().length
    ? `https://api.pexels.com/v1/search?query=${req.query.q}&per_page=${req.query.hits}&page=1`
    : `https://api.pexels.com/v1/curated?per_page=${req.query.hits}&page=1`;
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
            user: photo.photographer
          };
        })
      )
    )
    .catch(err => console.log(err));
});

app.get("/giphy/", (req, res) => {
  const key = "pJBwpveOGoFTbTPQe44xXkOghR8LACjC";
  let params = req.query.q.trim().length
    ? `/search?api_key=${key}&q=${req.query.q}&limit=${req.query.hits}`
    : `/trending?api_key=${key}&limit=${req.query.hits}`;

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






app.get("/api/photos/", (req, res) => {
  console.log(req.query);
  unsplash.photos
    .listPhotos(req.query.page, req.query.per_page, "latest")
    .then(toJson)
    .then(json => res.json(json));
});

app.listen(PORT, () => console.log(`Listening to port ${PORT}`));
