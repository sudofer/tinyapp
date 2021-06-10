// HELPER FUNCTIONS
function generateRandomString(length) {
  var result = [];
  var characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  var charactersLength = characters.length;
  for (var i = 0; i < length; i++) {
    result.push(
      characters.charAt(Math.floor(Math.random() * charactersLength))
    );
  }
  return result.join("");
}

const getUserByEmail = (email, users) => {
  if (email === "" || !users) {
    throw new Error("No valid input.");
  }
  for (const user in users) {
    if (users[user].email === email) {
      return users[user];
    }
  }
};

const urlForUser = (id, urlDatabase) => {
  let total = {};
  for (let key in urlDatabase) {
    if (urlDatabase[key].user_id === id) {
      total[key] = urlDatabase[key];
    }
  }
  return total;
};

module.exports = {
  generateRandomString,
  getUserByEmail,
  urlForUser,
};
