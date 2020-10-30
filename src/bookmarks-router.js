const express = require("express");
const logger = require("./logger");
const { v4: uuid } = require("uuid");
const BookmarksService = require('./BookmarksService')
const bookmarks = [];

const bookmarksRouter = express.Router();
const bodyParser = express.json();

bookmarksRouter
  .route("/bookmarks")
  .get(async(req, res) => {
    const db = req.app.get('db');
    const allBookmarks = await BookmarksService.getBookmarks(db);
    res.json(allBookmarks);
  })
  .post(bodyParser, (req, res) => {
    const id = uuid();
    const { title, url, rating, description } = req.body;

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
    if (!description) {
      logger.error(`${req.method} ${req.path} description is required`);
      return res.status(400).send("Invalid Data");
    }
    const bookmark = { id, title, url, rating, description };
    bookmarks.push(bookmark);
    res.json(bookmark);
  });

bookmarksRouter
  .route("/bookmarks/:id")
  .get(async (req, res) => {
    const { id } = req.params;
    const db = req.app.get('db')
    const bookmark = await BookmarksService.getBookmarkById(db,id);
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
