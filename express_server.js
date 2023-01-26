const express = require("express");
var cookieParser = require("cookie-parser");
const { render } = require("express/lib/response");
const app = express();
const PORT = 8080; // default port 8080
app.set("view engine", "ejs");
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
function generateRandomString() {
  const chars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXTZabcdefghiklmnopqrstuvwxyz";
  let randID = "";
  for (let i = 0; i < 6; i++) {
    const randLetter = chars[Math.floor(Math.random() * chars.length)];
    randID += randLetter;
  }
  return randID;
}

const users = {
  user1: { id: "user1", email: "123@example.com", password: "12345" },
};
const urlDatabase = {
  b2xVn2: "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com",
};
const emailLookUp = function (email) {
  for (let i in users) {
    if (users[i].email === email) {
      return true;
    }
  }
  return false;
};
const checkPassword = function (email, password) {
  for (let i in users) {
    if (users[i].email === email) {
      if (users[i].password === password) {
        return true;
      }
    }
  }
  return false;
};
const getUserIdFromEmail = function (email) {
  for (let i in users) {
    if (users[i].email === email) {
      return users[i].id;
    }
  }
};

app.get("/", (req, res) => {
  res.send("Hello!");
});
app.get("/login", (req, res) => {
  if (req.cookies["user_id"]) {
    return res.redirect("/urls");
  }
  const user = users[req.cookies["user_id"]];
  const templateVars = {
    user,
  };
  res.render("urls_login", templateVars);
});
app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  if (!emailLookUp(email)) {
    res.status(403);
    return res.send("error code 403");
  }
  if (emailLookUp(email)) {
    if (!checkPassword(email, password)) {
      res.status(403);
      return res.send("error code 403");
    }
    if (checkPassword(email, password)) {
      res.cookie("user_id", getUserIdFromEmail(email));
      return res.redirect("/urls");
    }
  }
});
app.post("/logout", (req, res) => {
  res.clearCookie("user_id");
  res.redirect("/login");
});
app.get("/register", (req, res) => {
  if (req.cookies["user_id"]) {
    return res.redirect("/urls");
  }
  const user = users[req.cookies["user_id"]];
  const templateVars = {
    user,
  };
  res.render("urls_register", templateVars);
});
app.post("/register", (req, res) => {
  if (!req.body.email || !req.body.password || emailLookUp(req.body.email)) {
    res.status(400);
    res.send("error code 400");
  } else {
    const userID = generateRandomString();
    users[userID] = {
      id: userID,
      email: req.body.email,
      password: req.body.password,
    };
    //res.cookie("user_id", userID);
    //console.log(users);
    res.redirect("/urls");
  }
});
app.get("/urls/new", (req, res) => {
  if (!req.cookies["user_id"]) {
    return res.redirect("/login");
  }
  const user = users[req.cookies["user_id"]];
  const templateVars = {
    user,
  };
  res.render("urls_new", templateVars);
});
app.post("/urls/:id", (req, res) => {
  const longURL = req.body.longURL;
  urlDatabase[req.params.id] = longURL;
  res.redirect("/urls");
});
app.post("/urls/:id/delete", (req, res) => {
  const URLToRemove = req.params.id;

  delete urlDatabase[URLToRemove];

  res.redirect("/urls");
});

app.get("/u/:id", (req, res) => {
  if (!urlDatabase[req.params.id]) {
    res.send("sorry the url you requested does not exist");
  }
  const longURL = urlDatabase[req.params.id];
  res.redirect(longURL);
});
app.post("/urls", (req, res) => {
  if (!req.cookies["user_id"]) {
    return res.send("only loged in users can change urls");
  }
  const longURL = req.body.longURL;
  const id = generateRandomString();
  urlDatabase[id] = longURL;
  res.redirect(`/urls/${id}`);
});
app.get("/urls/:id", (req, res) => {
  const user = users[req.cookies["user_id"]];
  const templateVars = {
    user,
    id: req.params.id,
    longURL: urlDatabase[req.params.id],
  };
  res.render("urls_show", templateVars);
});
app.get("/urls", (req, res) => {
  const user = users[req.cookies["user_id"]];
  const templateVars = {
    urls: urlDatabase,
    user,
  };
  res.render("urls_index", templateVars);
});
app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
