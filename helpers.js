const getUserByEmail = (email, database) => {
  let foundUser = null;
  for (const user in database) {
    if (email === database[user].email) {
      foundUser = database[user];
      return foundUser;
    }
  }
  return foundUser;
}

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

const urlsForUser = (id, dbObject) => {
  let urls = {};
  for (const url in dbObject) {
    if (dbObject[url].userID === id) {
      urls[url] = dbObject[url];
    }
  }
  return urls;
}

const isUserUrl = (shortUrl, id, dbObject) => {
  for (const url in dbObject) {
    if (dbObject[url].userID === id && url === shortUrl) {
      return true;
    }
  }
  return false;
}

module.exports = {getUserByEmail, generateRandomString, urlsForUser, isUserUrl}