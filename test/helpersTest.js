const { assert } = require("chai");

const { getUserByEmail, generateRandomString } = require("../helpers.js");

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
    const user = getUserByEmail("user@example.com", testUsers);
    const expectedOutput = "userRandomID";
    assert.equal(user.id, expectedOutput);
  });
  it("should return undefined when passed an email that is not in our DB", function () {
    const user = getUserByEmail("andres@gmail.com", testUsers);

    const expectedOutput = undefined;

    assert.equal(user, expectedOutput);
  });
  it("should throw error, if not given all inputs", function () {
    //const user = getUserByEmail("ec", testUsers);
    //const expectedOutput = Error("no valid input");
    assert.throws(() => {
      return getUserByEmail("", testUsers);
    }, "No valid input.");
  });
});

describe("generateRandomString", function () {
  it("should generate a 6-chr string", function () {
    const actual = generateRandomString(6);
    const expectedOutput = 6;

    assert.equal(actual.length, expectedOutput);
  });
  it("should generate an empty string if no param", function () {
    const actual = generateRandomString();
    const expectedOutput = "";

    assert.equal(actual, expectedOutput);
  });
});
