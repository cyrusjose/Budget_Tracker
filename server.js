require("dotenv").config();

const express = require("express");
// const logger = require("morgan");
const mongoose = require("mongoose");
const compression = require("compression");

const PORT = process.env.PORT || 3000;

const app = express();

const db = mongoose.connection;

// app.use(logger("dev"));

app.use(compression());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(express.static("public"));

mongoose.connect(process.env.DATABASE_URL, {
  useNewUrlParser: true,
  // useFindAndModify: false,
  // useCreateIndex: true,
  useUnifiedTopology: true
});

db.on("error", error => console.error(error));
db.once("open", () => console.log("connected to mongoose"));

// routes
app.use(require("./routes/api.js"));

app.listen(PORT, () => {
  console.log(`App running on port: http://localhost:${PORT}`);
});
