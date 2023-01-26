const getUserIdFromEmail = function (email, database) {
  for (let i in database) {
    if (database[i].email === email) {
      return database[i].id;
    }
  }
};

module.exports = {
  getUserIdFromEmail,
};
