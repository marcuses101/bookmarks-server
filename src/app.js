require("dotenv").config();
const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
const helmet = require("helmet");
const { NODE_ENV, API_KEY  } = require("./config");
const logger = require("./logger");
const bookmarksRouter = require("./bookmarks-router");

const app = express();

const morganOption = NODE_ENV === "production" ? "tiny" : "dev";

app.use(morgan(morganOption));
app.use(helmet());
app.use(cors());
app.use(express.json())

app.use((req,res,next)=>{
  if(!req.headers.authorization || req.headers.authorization.split(" ")[1] !== API_KEY){
    logger.error(`Unauthorized request to path: ${req.path}`);
    return res.status(401).json({error: 'Unauthorized request'})
  }
  next();
})

app.use("/bookmarks",bookmarksRouter);

app.get("/", (req, res) => {
  res.send("Hello, world!");
});

app.use((error, req, res, next) => {
  let response;
  if (NODE_ENV === "production") {
    response = { error: { message: "server error" } };
  } else {
    logger.error(error);
    response = { message: error.message, error };
  }
  res.status(500).json(response);
});

module.exports = app;
