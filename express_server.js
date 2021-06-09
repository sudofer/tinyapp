const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
app.use(cookieParser());
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));

const urlDatabase = {
  b6UTxQ: { longURL: "https://www.tsn.ca", user_id: "aJ48lW" },
  i3BoGr: { longURL: "https://www.google.ca", user_id: "aJ48lW" },
};

const users = {
  userRandomID: {
    id: "aJ48lW",
    email: "user@example.com",
    password: "purple-monkey-dinosaur",
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk",
  },
};

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/set", (req, res) => {
  const a = 1;
  res.send(`a = ${a}`);
});

app.get("/fetch", (req, res) => {
  res.send(`a = ${a}`);
});

app.get("/urls", (req, res) => {
  const user_id = req.cookies["user_id"];

  const templateVars = {
    user: users[user_id],
    urls: urlForUser(user_id),
  };
  res.render("urls_index", templateVars);
  console.dir(templateVars);
});

app.post("/urls", (req, res) => {
  // Log the POST request body to the console
  const user_id = req.cookies.user_id;
  const shortURL = generateRandomString(6);
  const longURL = req.body.longURL;
  urlDatabase[shortURL] = { longURL, user_id };
  console.log(urlDatabase);
  res.redirect(`/urls/${shortURL}`);
});

app.get("/urls/new", (req, res) => {
  const user = req.cookies.user_id;

  if (!user) {
    res.redirect("/login");
  }

  res.render("urls_new", { user });
});
//shows us short/long url and offers link to /u/ which redirects
app.get("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const longURL = urlDatabase[shortURL];
  const user = users[req.cookies.user_id];
  const templateVars = {
    user,
    shortURL,
    longURL,
  };
  res.render("urls_show", templateVars);
});

app.post("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const user = users[req.cookies.user_id];
  console.log("USER", user);

  const longURL = req.body.longURL;
  urlDatabase[shortURL].longURL = longURL;
  console.log(urlDatabase);
  res.redirect(`/urls/${shortURL}`);
});
//redirecting to original url
app.get("/u/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const longURL = urlDatabase[shortURL];
  res.redirect(longURL);
});
// deleting and refreshing /urls
app.post("/urls/:shortURL/delete", (req, res) => {
  const shortURL = req.params.shortURL;
  console.log("urlDatabase -------", urlDatabase);
  console.log("shortURL -------", shortURL);
  if (urlDatabase[shortURL].user_id === req.cookies.user_id) {
    delete urlDatabase[shortURL];
  }
  res.redirect("/urls");
});

app.post("/login", (req, res) => {
  const body = req.body;

  const user = emailExists(body.email, users);
  if (!user) {
    return res.status(400).send("User not found");
  }
  if (user.password !== body.password) {
    return res.status(400).send("Invalid Login");
  }
  console.log(`--------`, user);
  res.cookie("user_id", user.id);
  res.redirect("/urls");
});

app.get("/login", (req, res) => {
  res.render("login");
});

app.post("/logout", (req, res) => {
  res.clearCookie("user_id");
  res.redirect("/urls");
});

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
  users[ID] = { id: ID, email: signUp.email, password: signUp.password };
  console.log("users", users);
  res.cookie("user_id", ID);
  res.redirect("/urls");
});

// app.post("/update", (req, res) => {
//   console.log(req.body);
// });

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

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

const urlForUser = (id) => {
  let total = {};
  for (let key in urlDatabase) {
    if (urlDatabase[key].user_id === id) {
      total[key] = urlDatabase[key];
    }
  }
  return total;
};
