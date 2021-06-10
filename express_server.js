const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
app.use(cookieParser());
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
  if (req.cookie) {
    return res.redirect("/urls");
  }
  res.redirect("/login");
});

//POTENTIAL API
/* app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
}); */

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

// MAIN PAGE
app.get("/urls", (req, res) => {
  const user_id = req.cookies["user_id"];
  const templateVars = {
    user: users[user_id],
    urls: urlForUser(user_id),
  };
  res.render("urls_index", templateVars);
  console.dir(templateVars);
});

// NEW URL SUBMITTION
app.post("/urls", (req, res) => {
  const user_id = req.cookies.user_id;
  const shortURL = generateRandomString(6);
  let longURL = req.body.longURL;
  if (!longURL.includes("http://")) {
    longURL = "http://" + longURL;
  }
  urlDatabase[shortURL] = { longURL, user_id };
  console.log(urlDatabase);
  res.redirect(`/urls/${shortURL}`);
});
//LINK TO URL CREATOR
app.get("/urls/new", (req, res) => {
  const user = req.cookies.user_id;

  if (!user) {
    res.redirect("/login");
  }

  res.render("urls_new", { user });
});
//URL'S PAGE, LINK TO REDIRECT
app.get("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const longURL = urlDatabase[shortURL].longURL;
  const user = users[req.cookies.user_id];
  const templateVars = {
    user,
    shortURL,
    longURL,
  };
  res.render("urls_show", templateVars);
});
//SET OR UPDATE URL
app.post("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const user = users[req.cookies.user_id];
  console.log("USER", user);

  let longURL = req.body.longURL;
  if (!longURL.includes("http://")) {
    longURL = "http://" + longURL;
  }
  urlDatabase[shortURL].longURL = longURL;
  console.log(urlDatabase);
  res.redirect(`/urls/${shortURL}`);
});
//REDIRECTING TO LONG URL
app.get("/u/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const longURL = urlDatabase[shortURL].longURL;
  console.log(shortURL, "<- short url");
  console.log(urlDatabase);
  res.redirect(longURL);
});
// DELETING
app.post("/urls/:shortURL/delete", (req, res) => {
  const shortURL = req.params.shortURL;
  if (urlDatabase[shortURL].user_id === req.cookies.user_id) {
    delete urlDatabase[shortURL];
  }
  res.redirect("/urls");
});
//LOGIN
app.post("/login", (req, res) => {
  const body = req.body;
  //CHECK FOR VALID INPUT
  const user = emailExists(body.email, users);
  if (!user) {
    return res.status(400).send("User not found");
  }

  if (!bcrypt.compareSync(body.password, user.password)) {
    return res.status(400).send("Invalid Login");
  }
  console.log(`--------`, user);
  res.cookie("user_id", user.id);
  res.redirect("/urls");
});

app.get("/login", (req, res) => {
  res.render("login");
});
//LOGOUT
app.post("/logout", (req, res) => {
  res.clearCookie("user_id");
  res.redirect("/urls");
});
//REGISTER
app.get("/register", (req, res) => {
  res.render("form_registration");
});

app.post("/register", (req, res) => {
  const signUp = req.body;
  // CHECK FOR VALID INPUT
  if (signUp.email === "" || signUp.password === "") {
    return res.status(403).send("Please provide valid credentials.");
  }
  if (emailExists(signUp.email, users)) {
    return res.status(403).send("Something went wrong!");
  }
  const ID = generateRandomString(6);
  let password = bcrypt.hashSync(signUp.password, saltRounds);
  users[ID] = { id: ID, email: signUp.email, password };
  console.log("users", users);
  res.cookie("user_id", ID);
  res.redirect("/urls");
});

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

const emailExists = (email, users) => {
  for (const user in users) {
    if (users[user].email === email) {
      return users[user];
    }
  }
};

const urlForUser = (id) => {
  let total = {};
  for (let key in urlDatabase) {
    if (urlDatabase[key].user_id === id) {
      total[key] = urlDatabase[key];
    }
  }
  return total;
};

//LISTENER
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
