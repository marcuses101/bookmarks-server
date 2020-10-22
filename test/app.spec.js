require("dotenv").config;
const { expect } = require("chai");
const supertest = require("supertest");
const app = require("../src/app");
const { bookmarks } = require("../src/store");
const { API_KEY } = require("../src/config");
const auth = `Bearer ${API_KEY}`;

describe("App", () => {
  it('GET / responds with 200 containing "Hello, world!"', () => {
    return supertest(app)
      .get("/")
      .set("Authorization", auth)
      .expect(200, "Hello, world!");
  });
  it("GET /bookmarks responds with 200 containing an array of all bookmarks", () => {
    return supertest(app)
      .get("/bookmarks")
      .set("Authorization", auth)
      .expect(200)
      .expect("Content-Type", /json/)
      .then((res) => expect(res.body).to.deep.equal(bookmarks));
  });
  it("GET /bookmarks/:id returns the appropriate bookmark", () => {
    return supertest(app)
      .get("/bookmarks/2")
      .set("Authorization", auth)
      .expect(200)
      .then((res) => expect(res.body.id).to.equal(2));
  });
});
