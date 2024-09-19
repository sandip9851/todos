const { name } = require("ejs");
const mongoose = require("mongoose");
const { type } = require("os");

const schema = mongoose.Schema;

const userSchema = new  schema({
  name : {
    type : String,
    required : true
  },
  email : {
    type : String,
    required : true,
    unique : true,

  },
  username : {
    type : String,
    required : true,
    unique : true,
  },
  password : {
    type : String,
    required : true
  }
})


module.exports = mongoose.model("user",userSchema);
