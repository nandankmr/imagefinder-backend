const router = require("express").Router();
const ImageUser = require("../models/ImageUser");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const config = require("config");
const auth = require("../middleware/auth");

router.post("/register", (req, res) => {
  console.log(req.body);
  ImageUser.findOne({ email: req.body.email }, (err, data) => {
    if (data) res.status(400).json({ msg: "User already exists. " });
    else {
      const { name, email, password } = req.body;
      const newUser = new ImageUser({ name, email, password });
      bcrypt.genSalt(10, (err, salt) => {
        if (err) res.status(400).json({ msg: "Something went wrong" });
        else
          bcrypt.hash(password, salt).then(value => {
            newUser.password = value;
            newUser.save();
            const token = jwt.sign(
              { id: newUser._id, name: newUser.name },
              config.get("jwt_key"),
              { expiresIn: "2h" }
            );
            console.log(token);
            res.json({
              token,
              user: { name, email, favorites: newUser.favorites.map(v => v.id) }
            });
          });
      });
    }
  });
});

router.post("/login", (req, res) => {
  const { email, password } = req.body;
  ImageUser.findOne({ email }, (err, data) => {
    if (err) console.log(err);

    if (!data) res.status(400).json({ msg: "User does not exist." });
    else {
      bcrypt.compare(password, data.password).then(isMatch => {
        if (isMatch) {
          const token = jwt.sign(
            { id: data._id, name: data.name },
            config.get("jwt_key"),
            { expiresIn: "2h" }
          );
          res.json({
            token,
            user: {
              email,
              name: data.name,
              favorites: data.favorites.map(v => v.id)
            }
          });
        } else res.status(400).json({ msg: "Invalid credentials" });
      });
    }
  });
});

router.put("/addfavorite", auth, (req, res) => {
  ImageUser.findById(req.user.id, (_err, data) => {
    data.favorites = [req.body, ...data.favorites];
    data.save().then(doc => res.json(req.body.id));
  });
});

router.get("/getfavorites", auth, (req, res) => {
  ImageUser.findById(req.user.id, (err, data) => {
    res.json(data.favorites);
  });
});

router.put("/removefavorite", auth, (req, res) => {
  ImageUser.findById(req.user.id, (err, data) => {
    data.favorites = data.favorites.filter(value => value.id !== req.body.id);
    data.save().then(doc => res.json(req.body.id));
  });
});

module.exports = router;
