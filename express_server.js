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
  b2xVn2: {
    longURL: "http://www.lighthouselabs.ca",
    userID: "user1",
  },
  "9sm5xK": {
    longURL: "http://www.google.com",
    userID: "user1",
  },
};
const urlsForUser = function (id) {
  const isUsers = {};
  for (let i in urlDatabase) {
    if (urlDatabase[i].userID === id) {
      isUsers[i] = urlDatabase[i];
    }
  }
  return isUsers;
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
    console.log(users);
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
  urlDatabase[req.params.id].longURL = longURL;
  res.redirect("/urls");
});
app.post("/urls/:id/delete", (req, res) => {
  let idExist = false;

  for (let i in urlDatabase) {
    if (req.params.id === i) {
      idExist = true;
    }
  }
  if (idExist === false) {
    return res.send("this URL doesn't exist");
  }

  if (!req.cookies["user_id"]) {
    return res.send("only logged in users can see or modify URL");
  }
  if (req.cookies["user_id"] !== urlDatabase[req.params.id].userID) {
    return res.send("this URL does not belone to you");
  }

  const URLToRemove = req.params.id;

  delete urlDatabase[URLToRemove];

  res.redirect("/urls");
});

app.get("/u/:id", (req, res) => {
  console.log(req.params.id);
  if (!urlDatabase[req.params.id]) {
    return res.send("sorry the url you requested does not exist");
  }
  const longURL = urlDatabase[req.params.id].longURL;
  res.redirect(longURL);
});
app.post("/urls", (req, res) => {
  if (!req.cookies["user_id"]) {
    return res.send("only loged in users can change urls");
  }
  const longURL = req.body.longURL;
  const id = generateRandomString();
  urlDatabase[id] = {};
  urlDatabase[id].longURL = longURL;
  urlDatabase[id].userID = req.cookies["user_id"];
  res.redirect(`/urls/${id}`);
});
app.get("/urls/:id", (req, res) => {
  let idExist = false;

  for (let i in urlDatabase) {
    if (req.params.id === i) {
      idExist = true;
    }
  }
  if (idExist === false) {
    return res.send("this URL doesn't exist");
  }

  if (!req.cookies["user_id"]) {
    return res.send("only logged in users can see URL");
  }

  if (req.cookies["user_id"] !== urlDatabase[req.params.id].userID) {
    return res.send("this URL does not belone to you");
  }
  const user = users[req.cookies["user_id"]];
  const templateVars = {
    user,
    id: req.params.id,
    longURL: urlDatabase[req.params.id].longURL,
  };
  res.render("urls_show", templateVars);
});
app.get("/urls", (req, res) => {
  if (!req.cookies["user_id"]) {
    return res.send("sorry you have to be logged in to see the urls");
  }
  const user = users[req.cookies["user_id"]];
  const isUsers = urlsForUser(req.cookies["user_id"]);
  console.log(isUsers);
  console.log(req.cookies["user_id"]);
  const templateVars = {
    urls: isUsers,
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
