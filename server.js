const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const config = require("config");

const PORT = process.env.PORT || 5000;

mongoose.set("useCreateIndex", true);
mongoose
  .connect(process.env.ATLAS_KEY, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
  .then(() => console.log("db connected"));

const app = express();
app.use(cors());

app.use(express.json());

app.use("/user/", require("./routes/user"));

app.use("/api/", require("./routes/api"));

app.listen(PORT, () => console.log(`Listening to port ${PORT}`));
