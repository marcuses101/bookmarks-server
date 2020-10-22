const { expect } = require("chai");
const supertest = require("supertest");
const app = require("../src/app");
const { bookmarks } = require("../src/store");

describe("App", () => {
  it('GET / responds with 200 containing "Hello, world!"', () => {
    return supertest(app).get("/").expect(200, "Hello, world!");
  });
  it("GET /bookmarks responds with 200 containing an array of all bookmarks", () => {
    return supertest(app)
      .get("/bookmarks")
      .expect(200)
      .expect("Content-Type", /json/)
      .then(res=>expect(res.body).to.deep.equal(bookmarks))
  });
  it("GET /bookmarks/:id returns the appropriate bookmark", () => {
    return supertest(app)
      .get("/bookmarks/2")
      .then((res) => expect(res.body.id).to.equal(2));
  });

});
