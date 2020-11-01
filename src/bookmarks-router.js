const express = require("express");
const logger = require("./logger");
const BookmarksService = require("./BookmarksService");
const xss = require("xss");

const bookmarksRouter = express.Router();
const bodyParser = express.json();

function sanitizeBookmark(bookmark){
  return {
    ...bookmark,
    title: xss(bookmark.title),
    url: xss(bookmark.url),
    description: xss(bookmark.description),
  }
}

bookmarksRouter
  .route("/")
  .get(async (req, res) => {
    const db = req.app.get("db");
    const allBookmarks = await BookmarksService.getBookmarks(db);
    const sanitizedBookmarks = allBookmarks.map(bookmark=>sanitizeBookmark(bookmark))
    res.json(sanitizedBookmarks);
  })
  .post(bodyParser, async (req, res) => {
    const db = req.app.get("db");
    const { title, url, rating, description } = req.body;
    const bookmark = sanitizeBookmark({ title, url, rating, description });
    if (!["1","2","3","4","5"].includes(rating)) return res.status(400).send('invalid rating')
    for (const [key, value] of Object.entries(bookmark)) {
      if (!value) {
        logger.error(`${req.path} ${key} is required`);
        return res.status(400).send(`${key} is required`);
      }
    }
    const newEntry = await BookmarksService.createBookmark(db, bookmark);
    res.status(201).json(newEntry);
  });

bookmarksRouter
  .route("/:id")
  .all(async (req, res, next) => {
    const { id } = req.params;
    const db = req.app.get("db");
    const bookmark = await BookmarksService.getBookmarkById(db, id);
    if (!bookmark) return res.status(404).json({ error: "Not Found" });
    req.bookmark = sanitizeBookmark(bookmark);
    next();
  })
  .get(async (req, res) => {
    res.json(req.bookmark);
  })
  .delete(async (req, res) => {
    await BookmarksService.deleteBookmark(req.app.get("db"), req.bookmark.id);
    res.status(204).send("bookmark deleted");
  })
  .put(async (req, res) => {
    const db = req.app.get("db");
    await BookmarksService.updateBookmark(db, req.bookmark.id, req.body);
    const newBookmark = await BookmarksService.getBookmarkById(
      db,
      req.bookmark.id
    );
    res.status(202).json(newBookmark);
  });

module.exports = bookmarksRouter;
