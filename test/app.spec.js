require("dotenv").config();
const { expect } = require("chai");
const supertest = require("supertest");
const knex = require("knex");
const app = require("../src/app");
const bookmarks = require("./bookmarks.fixtures");
const API_KEY = process.env.API_KEY;
const auth = `Bearer ${API_KEY}`;

let db = {};

describe("Bookmarks-server", () => {
  before("connect to database", () => {
    db = knex({
      client: "pg",
      connection: process.env.TEST_DB_URL,
    });
    app.set("db", db);
  });

  before("clean the table", () => {
    return db("bookmarks").truncate();
  });

  after("disconnect from database", () => {
    return db.destroy();
  });

  it('GET / responds with 200 containing "Hello, world!"', () => {
    console.log(auth);
    return supertest(app)
      .get("/")
      .set("Authorization", auth)
      .expect(200, "Hello, world!");
  });

  describe("GET /bookmarks", () => {
    context(`'bookmarks' table contains data`, () => {
      beforeEach("insert data into table", () => {
        return db.into("bookmarks").insert(bookmarks);
      });
      afterEach("clear table", () => {
        return db("bookmarks").truncate();
      });

      it("responds with 200 containing an array of all bookmarks", () => {
        return supertest(app)
          .get("/bookmarks")
          .set("Authorization", auth)
          .expect(200)
          .expect("Content-Type", /json/)
          .then((res) => expect(res.body).to.eql(bookmarks));
      });
    });
    context(`'bookmarks' table is empty`, () => {
      it("responds with 200 and an empty array", () => {
        return supertest(app)
          .get("/bookmarks")
          .set("Authorization", auth)
          .expect(200, []);
      });
    });
  });
  describe("GET /bookmarks/:id", () => {
    context(`'bookmarks' table contains data`, () => {
      beforeEach("insert data into table", () => {
        return db.into("bookmarks").insert(bookmarks);
      });

      afterEach("clear table", () => {
        return db("bookmarks").truncate();
      });

      it("returns the appropriate bookmark", () => {
        return supertest(app)
          .get("/bookmarks/2")
          .set("Authorization", auth)
          .expect(200)
          .then((res) => expect(res.body).to.eql(bookmarks.find(bookmark=>bookmark.id==2)));
      });
    });
    context(`'bookmarks' table is empty`, () => {
      it(`responds with 404`,()=>{
        return supertest(app)
        .get(`/articles/2`)
        .set("Authorization", auth)
        .expect(404)
      })
    });
  });
});
