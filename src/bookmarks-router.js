const express = require("express");
const logger = require("./logger");
const { v4: uuid } = require("uuid");
const { bookmarks } = require("./store");

const bookmarksRouter = express.Router();
const bodyParser = express.json();

bookmarksRouter
  .route("/bookmarks")
  .get((req, res) => {
    res.json(bookmarks);
  })
  .post(bodyParser, (req, res) => {
    const id = uuid();
    const { title, url, rating, desc } = req.body;

    if (!title) {
      logger.error(`${req.method} ${req.path} Title is required`);
      return res.status(400).send("Invalid Data");
    }
    if (!url) {
      logger.error(`${req.method} ${req.path} url is required`);
      return res.status(400).send("Invalid Data");
    }
    if (!rating) {
      logger.error(`${req.method} ${req.path} rating is required`);
      return res.status(400).send("Invalid Data");
    }
    if (!desc) {
      logger.error(`${req.method} ${req.path} description is required`);
      return res.status(400).send("Invalid Data");
    }
    const bookmark = { id, title, url, rating, desc };
    bookmarks.push(bookmark);
    res.json(bookmark);
  });

bookmarksRouter
  .route("/bookmarks/:id")
  .get((req, res) => {
    const { id } = req.params;
    const bookmark = bookmarks.find((b) => b.id == id);
    if (!bookmark) return res.status(404).json({ error: "Not Found" });

    res.json(bookmark);
  })

  .delete((req, res) => {
    const { id } = req.params;
    const bookmarkIndex = bookmarks.findIndex((bookmark) => bookmark.id == id);
    if (bookmarkIndex === -1) return res.status(404).send("Not Found");

    const bookmark = bookmarks.splice(bookmarkIndex, 1);
    
    res.status(200).json(bookmark[0])
  });

module.exports = bookmarksRouter;
