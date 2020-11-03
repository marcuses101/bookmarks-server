const BookmarksService = {
  getBookmarks(knex) {
    return knex.select("*").from("bookmarks");
  },
  getBookmarkById(knex, id) {
    return knex.select("*").from("bookmarks").where({ id }).first();
  },
  async createBookmark(knex, bookmark) {
    const rows = await knex.insert(bookmark).into("bookmarks").returning("*");
    return rows[rows.length - 1];
  },
  async updateBookmark(knex, id, bookmark) {
    const bookmarkToUpdate = await knex
      .select("*")
      .from("bookmarks")
      .where({ id })
      .first();
    await knex("bookmarks").where({ id }).update({
      ...bookmarkToUpdate, ...bookmark, id: undefined
    });
    return Promise.resolve("updated bookmark");
  },
  deleteBookmark(knex, id) {
    return knex("bookmarks").where({ id }).delete();
  },
};

module.exports = BookmarksService;
