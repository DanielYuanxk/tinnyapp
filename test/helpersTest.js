const { assert } = require("chai");

const { getUserIdFromEmail } = require("../helpers.js");

const testUsers = {
  userRandomID: {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur",
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk",
  },
};

describe("getUserByEmail", function () {
  it("should return a user with valid email", function () {
    const user = getUserIdFromEmail("user@example.com", testUsers);
    const expectedUserID = "userRandomID";
    assert(user, expectedUserID);
  });
  it("should return undefined if email is invalid", function () {
    const user = getUserIdFromEmail("user@example.com", testUsers);
    assert(user, undefined);
  });
});
