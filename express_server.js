const express = require('express');
var cookieSession = require('cookie-session')
const bcrypt = require("bcryptjs");
const {getUserByEmail, generateRandomString, urlsForUser, isUserUrl} = require("./helpers")
const {users, urlDatabase} = require("./dbObjects")
const app = express();
const PORT = 3002;

//define middlewares here
app.set('view engine', 'ejs')
app.use(express.urlencoded({ extended: true }));
app.use(cookieSession({
  name: 'session',
  keys: ['key1', 'key2'],
  // Cookie Options
  maxAge: 10 * 60 * 1000, // 10 min
}))

app.get("/", (req, res) => {
  res.redirect("/login");
});

//display existing urls
app.get("/urls", (req, res) => {
  const userId = req.session.user_id;
  if (!userId) {
    return res.send("You need to log in first!")
  }
  const urlForUser = urlsForUser(userId, urlDatabase);

  const templateVars = { urls: urlForUser, user: users[userId]};
  res.render("pages/urls_index", templateVars);
});

//create new urls and assign random 6 char id
app.post("/urls", (req, res) => {
  const userId = req.session.user_id;
  if (!userId) {
    return res.send('You are not logged in. please log in and try again.');
  }
  const id  = generateRandomString(); //generate a random 6 character string
  urlDatabase[id] = { longURL : req.body.longURL, userID : userId} //retrieve the longUrl & userId and add to urlDatabase object
  res.redirect(`/urls/${id}`) //redirect to show short and long urls once short url has been generated
});

//create new urls
app.get("/urls/new", (req, res) => {
  const userId = req.session.user_id;
  if (!userId) {
    return res.redirect('/login');
  }

  const templateVars = { user: users[userId] };
  res.render("pages/urls_new", templateVars);
});

//show a particular and update url if needed
app.get("/urls/:id", (req, res) => {
  const userId = req.session.user_id;
  if (!userId) {
    return res.send('You are not logged in!');
  }

  if (!isUserUrl(req.params.id, userId, urlDatabase)) {
    return res.send('You are not authorized to perform this operation!')
  }

  const templateVars = { id: req.params.id, longURL: urlDatabase[req.params.id].longURL,
    user: users[userId]
  };

  res.render("pages/urls_show", templateVars);
});

//update an existing url and redirect to /Urls page
app.post("/urls/:id", (req, res) => {
  const userId = req.session.user_id;

  if (!isUserUrl(req.params.id, userId, urlDatabase)) {
    return res.send('You are not authorized to perform this operation!')
  }

  urlDatabase[req.params.id] = { longURL: req.body.newLongName, userID: userId } ;
  res.redirect('/urls');
});

//launch actually long url
app.get("/u/:id", (req, res) => {
  const longURL = urlDatabase[req.params.id].longURL;
  if (!longURL) {
    return res.send('sorry, Url does not exist!')
  }
  res.redirect(longURL);
});

//delete existing url
app.post("/urls/:id/delete", (req, res) => {
  const userId = req.session.user_id;

  if (!isUserUrl(req.params.id, userId, urlDatabase)) {
    return res.send('You are not authorized to perform the delete operation!')
  }
  delete urlDatabase[req.params.id]; //grap the id parameter and delete from the urlDatabase object
  res.redirect('/urls'); //redirect to the /url api
});

// Register route
app.get("/register", (req, res) => {
  const userId = req.session.user_id;
  if (userId) {
    res.redirect("/urls");
  }
  const templateVars = {user: users[userId]};
  res.render("pages/user_register", templateVars);
});

// // API Register
app.post('/register', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).send("Invalid credentials!");
  }

  const userExist = getUserByEmail(email, users);
  if (userExist) {
    return res.status(400).send("User already exist!");
  }

  const id = generateRandomString();
  const hashedPassword = bcrypt.hashSync(password, 8);

  users[id] = {
    id,
    email,
    password : hashedPassword,
  };

  req.session.user_id = users[id].id;
  res.redirect('/urls');
});

//login get route
app.get('/login', (req, res) => {
  const userId = req.session.user_id;
  if (userId) {
    res.redirect("/urls");
  }
  const templateVars = {user: users[userId]};
  res.render("pages/user_login", templateVars);
});

//login post route
app.post("/login", (req, res) => {
  const { email, password } = req.body;
  const user = getUserByEmail(email, users);
  if (!user) {
    return res.status(403).send("User does not exist!");
  }

  if (!bcrypt.compareSync(password, user.password)) {
    return res.status(403).send("Invalid credentials!");
  }
  req.session.user_id = user.id;
  res.redirect('/urls');
});

//logout
app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect('/login');
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}`);
});