const express = require("express");
const app = express();

const morgan = require("morgan");
const cors = require("cors");
const bodyParser = require("body-parser");
const { readdirSync } = require("fs");
require("dotenv").config();

const mongoose = require("mongoose");
const mongoDb = process.env.MONGODB;
const port = process.env.PORT;

mongoose
  .connect(mongoDb, {
    useUnifiedTopology: true,
    useFindAndModify: false,
    useNewUrlParser: true,
  })
  .then(() => {
    console.log("connected to mmogoDb");
  })
  .catch((err) => {
    console.log(err);
  });

app.listen(port, () => {
  console.log(`listening on port ${port}`);
});

app.get("/", (req, res) => {
  res.json({ message: "Hello blog" });
});

//middlewares
app.use(bodyParser.json({ limit: "50mb" }));
app.use(
  bodyParser.urlencoded({
    limit: "50mb",
    extended: true,
    parameterLimit: 50000,
  })
);
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

//routes
readdirSync("./routes").map((r) => app.use("/api", require("./routes/" + r)));
