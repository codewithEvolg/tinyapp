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

module.exports = {getUserByEmail: getUserByEmail}