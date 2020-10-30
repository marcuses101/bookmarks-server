const BookmarksService = {
  getBookmarks(knex){
    return knex.select('*').from('bookmarks');
  },
  getBookmarkById(knex,id){
    return knex
    .select('*')
    .from('bookmarks')
    .where({id})
    .first();
  },
  createBookmark(knex, bookmark){
    return Promise.resolve('new bookmark created')
  },
  updateBookmark(knex, id, bookmark){
    return Promise.resolve('updated bookmark')
  },
  deleteBookmark(knex, id){
    return Promise.resolve('deleted bookmark')
  },
}

module.exports = BookmarksService