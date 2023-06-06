const express = require('express');
const cookieParser = require('cookie-parser')
const app = express();
const PORT = 3002;


const users = {
  userRandomID: {
    id: "userRandomID",
    email: "a@example.com",
    password: "123",
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "b@example.com",
    password: "456",
  },
};

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

function generateRandomString() {
  let result = '';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const charactersLength = characters.length;
    let counter = 0;
    while (counter < 6) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
      counter += 1;
    }
    return result;
}

//define middlewares here
app.set('view engine', 'ejs')
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

//display existing urls
app.get("/urls", (req, res) => {
  const userId = req.cookies["user_id"];
  const templateVars = { urls: urlDatabase, user: users[userId]};
  res.render("pages/urls_index", templateVars);
});

//create new urls and assign random 6 char id
app.post("/urls", (req, res) => {
  const id  = generateRandomString(); //generate a random 6 character string
  urlDatabase[id] = req.body.longURL; //retrieve the longUrl and add to urlDatabase object
  res.redirect(`/urls/${id}`) //redirect to show short and long urls once short url has been generated
});

//create new urls
app.get("/urls/new", (req, res) => {
  const userId = req.cookies["user_id"];
  const templateVars = { user: users[userId] };
  res.render("pages/urls_new", templateVars);
});

//show a particular and update url if needed
app.get("/urls/:id", (req, res) => {
  const userId = req.cookies["user_id"];

  const templateVars = { id: req.params.id, 
    longURL: urlDatabase[req.params.id], 
    user: users[userId] 
  };

  res.render("pages/urls_show", templateVars);
});

//update an existing url and redirect to /Urls page
app.post("/urls/:id", (req, res) => {
  urlDatabase[req.params.id] = req.body.newLongName;
  res.redirect('/urls');
});

//launch actually long url
app.get("/u/:id", (req, res) => {
  const longURL = urlDatabase[req.params.id];
  res.redirect(longURL);
});

//delete existing url
app.post("/urls/:id/delete", (req, res) => {
  delete urlDatabase[req.params.id]; //grap the id parameter and delete from the urlDatabase object
  res.redirect('/urls'); //redirec to the /url api
});

//login route
app.post("/login", (req, res) => {
  //const templateVars = { id: req.params.id, longURL: urlDatabase[req.params.id] };
  res.cookie('username', req.body);
  res.redirect('/urls');
});

app.post("/logout", (req, res) => {
  res.clearCookie('username');
  res.redirect('/urls');
});

// Register
app.get("/register", (req, res) => {
  const userId = req.cookies["user_id"];
  const templateVars = {user: users[userId]};
  res.render("pages/user_register", templateVars);
});

// // API Register
app.post('/register', (req, res) => {
  const id = generateRandomString();
  const { email, password } = req.body;

  //const hashedPassword = bcrypt.hashSync(password, 8);

  users[id] = {
    id,
    email,
    password,
  };
  res.cookie('user_id', id);
  console.log(users);
  res.redirect('/urls');
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}`);
});