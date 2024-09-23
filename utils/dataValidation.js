
//email validater regex
const isEmailValidate = ({ key }) => {
  const isEmail =
    /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/i.test(
      key
    );
  return isEmail;
};

//registration check validation
const userDataValidate = ({ name, email, username, password }) => {
  return new Promise((resolve, reject) => {
    // Check for missing fields
    if (!name || !email || !username || !password) {
      return reject("Missing user data");
    }

    // Type checks for string
    if (typeof name !== "string") return reject("Name must be a string");
    if (typeof email !== "string") return reject("Email must be a string");
    if (typeof username !== "string") return reject("Username must be a string");
    if (typeof password !== "string") return reject("Password must be a string");

    // Username length validation
    if (username.length < 3 || username.length > 20) {
      return reject("Username length should be between 3 and 20 characters");
    }

    if(!isEmailValidate({key : email})) reject("please enter right email id")

    resolve();
  });
};

module.exports = { userDataValidate,isEmailValidate };
