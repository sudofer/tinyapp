const {
  generateRandomString,
  getUserByEmail,
  urlForUser,
} = require("./helpers");
const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const bodyParser = require("body-parser");
const cookieSession = require("cookie-session");
app.use(cookieSession({ name: "session", keys: ["key1", "key2"] }));
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
const bcrypt = require("bcrypt");
const saltRounds = 10;

const urlDatabase = {
  b6UTxQ: { longURL: "https://www.tsn.ca", user_id: "aJ48lW" },
  i3BoGr: { longURL: "https://www.google.ca", user_id: "aJ48lW" },
};

const users = {
  userRandomID: {
    id: "aJ48lW",
    email: "user@example.com",
    password: bcrypt.hashSync("purple-monkey-dinosaur", saltRounds),
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: bcrypt.hashSync("dishwasher-funk", saltRounds),
  },
};
//ROOT REDIRECTS TO HOME
app.get("/", (req, res) => {
  if (req.session.user_id) {
    return res.redirect("/urls");
  }
  res.redirect("/login");
});

//POTENTIAL API
app.get("/urls.json", (req, res) => {
  res.json(users);
});

// MAIN PAGE
app.get("/urls", (req, res) => {
  const user_id = req.session.user_id;
  const templateVars = {
    user: users[user_id],
    urls: urlForUser(user_id, urlDatabase),
  };
  res.render("urls_index", templateVars);
});

// NEW URL SUBMITTION
app.post("/urls", (req, res) => {
  const user_id = req.session.user_id;
  const shortURL = generateRandomString(6);
  let longURL = req.body.longURL;
  if (!longURL.includes("http://")) {
    longURL = `http://${longURL}`;
  }
  urlDatabase[shortURL] = { longURL, user_id };
  res.redirect(`/urls/${shortURL}`);
});

//LINK TO URL CREATOR
app.get("/urls/new", (req, res) => {
  const user = req.session.user_id;

  if (!user) {
    return res.redirect("/login");
  }

  res.render("urls_new", { user });
});

//URL'S PAGE, LINK TO REDIRECT
app.get("/urls/:shortURL", (req, res) => {
  if (!req.session.user_id) {
    return res.redirect("/login");
  }

  const shortURL = req.params.shortURL;
  const longURL = urlDatabase[shortURL].longURL;
  const user = users[req.session.user_id];

  const author_id = urlDatabase[shortURL].user_id;

  const templateVars = {
    user: users[req.session.user_id],
    urls: urlForUser(req.session.user_id, urlDatabase),
  };

  if (user.id !== author_id) {
    console.log("userID:", user.id);
    console.log("authorID", author_id);
    return res.render("urls_index", templateVars);
  }

  const templateVars2 = {
    user,
    shortURL,
    longURL,
  };

  res.render("urls_show", templateVars2);
});

//SET OR UPDATE URL
app.post("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const user = users[req.session.user_id];

  let longURL = req.body.longURL;
  if (!longURL.includes("http://")) {
    longURL = "http://" + longURL;
  }
  urlDatabase[shortURL].longURL = longURL;

  res.redirect(`/urls/${shortURL}`);
});

//REDIRECTING TO LONG URL
app.get("/u/:shortURL", (req, res) => {
  if (!req.session.user_id) {
    return res.redirect("/login");
  }
  const shortURL = req.params.shortURL;
  const longURL = urlDatabase[shortURL].longURL;
  const author_id = urlDatabase[shortURL].user_id;
  const templateVars = {
    user: users[req.session.user_id],
    urls: urlForUser(req.session.user_id, urlDatabase),
  };

  if (req.session.user_id !== author_id) {
    return res.render("urls_index", templateVars);
  }

  res.redirect(longURL);
});

// DELETING
app.post("/urls/:shortURL/delete", (req, res) => {
  const shortURL = req.params.shortURL;
  if (urlDatabase[shortURL].user_id === req.session.user_id) {
    delete urlDatabase[shortURL];
  }
  res.redirect("/urls");
});

//LOGIN
app.post("/login", (req, res) => {
  const body = req.body;
  //CHECK FOR VALID INPUT
  const user = getUserByEmail(body.email, users);
  if (!user) {
    return res.status(400).send("User not found");
  }
  // CHECK PASSWORD
  if (!bcrypt.compareSync(body.password, user.password)) {
    return res.status(400).send("Invalid Login");
  }

  req.session.user_id = user.id;
  res.redirect("/urls");
});

app.get("/login", (req, res) => {
  if (req.session.user_id) {
    return res.redirect("/urls");
  }
  const user_id = req.session.user_id;
  const templateVars = {
    user: users[user_id],
  };
  res.render("login", templateVars);
});
//LOGOUT
app.post("/logout", (req, res) => {
  req.session.user_id = null;
  res.redirect("/urls");
});
//REGISTER

app.get("/register", (req, res) => {
  if (req.session.user_id) {
    return res.redirect("/urls");
  }
  const user_id = req.session.user_id;
  const templateVars = {
    user: users[user_id],
  };
  res.render("form_registration", templateVars);
});

app.post("/register", (req, res) => {
  const signUp = req.body;

  // CHECK FOR VALID INPUT
  if (signUp.email === "" || signUp.password === "") {
    return res.status(403).send("Please provide valid credentials.");
  }
  if (getUserByEmail(signUp.email, users)) {
    return res.status(403).send("Something went wrong!");
  }
  const ID = generateRandomString(6);
  let password = bcrypt.hashSync(signUp.password, saltRounds);
  users[ID] = { id: ID, email: signUp.email, password };

  req.session.user_id = ID;
  res.redirect("/urls");
});

//LISTENER
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
