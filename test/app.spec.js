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

  describe("/bookmarks route", () => {
    context(`'bookmarks' table contains data`, () => {
      beforeEach(`insert data in to the 'bookmarks' table`, () => {
        return db.into("bookmarks").insert(bookmarks);
      });

      afterEach(`remove data from 'bookmarks' table`, () => {
        return db("bookmarks").truncate();
      });

      it("GET responds with 200 containing an array of all bookmarks", () => {
        return supertest(app)
          .get("/bookmarks")
          .set("Authorization", auth)
          .expect(200)
          .expect("Content-Type", /json/)
          .then((res) => expect(res.body).to.eql(bookmarks));
      });
    });

    context(`'bookmarks' table is empty`, () => {
      afterEach(`remove data from 'bookmarks' array`, () => {
        return db("bookmarks").truncate();
      });

      it("GET responds with 200 and an empty array", () => {
        return supertest(app)
          .get("/bookmarks")
          .set("Authorization", auth)
          .expect(200, []);
      });

      const bookmarkKeys = ['title', 'url', 'description', 'rating']
      bookmarkKeys.forEach(key=>{
        const sampleBookmark = {
          title:"test title",
          url: 'test url',
          description: 'test description',
          rating: 'test rating'
        }
        delete sampleBookmark[key]

        it(`POST responds with 400 status if ${key} is missing`,()=>{
          return supertest(app)
          .post('/bookmarks')
          .set("Authorization", auth)
          .send(sampleBookmark)
          .expect(400);
        })
      })

      it("POST responds with 201 and the created object", () => {
        const newBookmark = {
          title: "Test title",
          description: "test description",
          url: "test url",
          rating: "5",
        };
        return supertest(app)
          .post("/bookmarks")
          .set("Authorization", auth)
          .send(newBookmark)
          .expect(201)
          .then((res) => expect(res.body).to.eql({ ...newBookmark, id: 1 }));
      });
    });
  });
  describe("/bookmarks/:id route", () => {
    context(`'bookmarks' table contains data`, () => {
      beforeEach(`insert data in to the 'bookmarks' table`, () => {
        return db.into("bookmarks").insert(bookmarks);
      });

      afterEach(`remove data from 'bookmarks' table`, () => {
        return db("bookmarks").truncate();
      });

      it("GET returns the appropriate bookmark", () => {
        return supertest(app)
          .get("/bookmarks/0")
          .set("Authorization", auth)
          .expect(200)
          .then((res) =>
            expect(res.body).to.eql(
              bookmarks.find((bookmark) => bookmark.id == 0)
            )
          );
      });

      it("PUT responds with 202 containing the updated bookmark", () => {
        return supertest(app)
          .put("/bookmarks/2")
          .set("Authorization", auth)
          .set("Content-Type", "application/json")
          .send({ ...bookmarks[0] })
          .expect(202)
          .then(() => {
            return supertest(app)
              .get("/bookmarks/2")
              .set("Authorization", auth)
              .then((res) =>
                expect(res.body).to.eql({ ...bookmarks[0], id: 2 })
              );
          });
      });

      it(`DELETE responds with 204 and removes the bookmark`, () => {
        const idToRemove = 1;
        const expectedBookmarks = bookmarks.filter(
          (bookmark) => bookmark.id != idToRemove
        );
        return supertest(app)
          .delete(`/bookmarks/${idToRemove}`)
          .set("Authorization", auth)
          .expect(204)
          .then(() => {
            return supertest(app)
              .get(`/bookmarks`)
              .set("Authorization", auth)
              .expect(expectedBookmarks);
          });
      });
    });

    context(`Given an XSS attack article`, () => {
      const maliciousArticle = {
        id: 911,
        url: "http://www.thisisbadstuff.com",
        rating: "3",
        title: 'Naughty naughty very naughty <script>alert("xss");</script>',
        description: `Bad image <img src="https://url.to.file.which/does-not.exist" onerror="alert(document.cookie);">. But not <strong>all</strong> bad.`,
      };
      beforeEach(`insert malicious article`, () => {
        return db.into("bookmarks").insert(maliciousArticle);
      });
      afterEach(`remove data from 'bookmarks table`, () => {
        return db("bookmarks").truncate();
      });
      it(`removes XSS attack content`, () => {
        return supertest(app)
          .get(`/bookmarks/${maliciousArticle.id}`)
          .set("Authorization", auth)
          .expect(200)
          .expect((res) => {
            expect(res.body.title).to.eql(
              'Naughty naughty very naughty &lt;script&gt;alert("xss");&lt;/script&gt;'
            );
            expect(res.body.description).to.eql(
              `Bad image <img src="https://url.to.file.which/does-not.exist">. But not <strong>all</strong> bad.`
            );
          });
      });
    });

    context(`'bookmarks' table is empty`, () => {
      it(`DELETE responds with 404`, () => {
        return supertest(app)
          .get(`/articles/2`)
          .set("Authorization", auth)
          .expect(404);
      });
    });
  });
});
