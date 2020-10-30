require("dotenv").config();
const { expect } = require("chai");
const knex = require("knex");
const BookmarksService = require("../src/BookmarksService");
const bookmarks = require("./bookmarks.fixtures");

let db = {};

describe("BookmarksService", () => {
  before("connect to database", () => {
    db = knex({
      client: "pg",
      connection: process.env.TEST_DB_URL,
    });
  });
  before("clean the table", () => {
   return db("bookmarks").truncate();
  });
  after("disconnect from database", () => {
   return db.destroy();
  });

  context(`'bookmarks' table contains data`, () => {
    beforeEach('insert bookmarks',()=>{
     return db.into('bookmarks').insert(bookmarks);
    })
    afterEach('clear the table',()=>{
      return db('bookmarks').truncate();
    })

    it('getBookmarks() returns all bookmarks',async()=>{
      const actual = await BookmarksService.getBookmarks(db);
      expect(actual).to.eql(bookmarks)
    })

    it('getBookmarkById() returns the correct bookmark object',async()=>{
      const id = 1;
      const actual = await BookmarksService.getBookmarkById(db,id);
      expect(actual).to.eql(bookmarks.find(bookmark=>bookmark.id==id))
    })
  });
  context(`'bookmarks' table is empty`, async() => {
    it('getBookmarks() returns an empty array',async()=>{
      const actual = await BookmarksService.getBookmarks(db);
      expect(actual).to.eql([]);
    })
    it('getBookmarkById() returns null',async()=>{
      const id = 2
      const actual = await BookmarksService.getBookmarkById(db,id);
      expect(actual).to.be.undefined;
    })
  });
});
