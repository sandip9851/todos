//import
const express = require("express");
const mongoose = require("mongoose");
require('dotenv').config()
const bcrypt = require("bcryptjs")
const session = require("express-session");
const mongodbSession = require("connect-mongodb-session")(session)


//file-imports
const { userDataValidate, isEmailValidate } = require("./utils/dataValidation");
const userModel = require("./models/userModel");
const isAuth = require("./utils/isAuth");
const todoModel = require("./models/todoModel");
const { todoValidation } = require("./utils/todoValidation");

//constants

const app = express();
const port = process.env.port || 8000 
const db_uri = process.env.dataBaseUrl
const STORE = new mongodbSession({
  uri : process.env.dataBaseUrl,
  collection : "sessions"
}) 

//db connection
mongoose.connect(db_uri).then(()=>{
  console.log("db conncetion succesfull")
}).catch((err)=>{
  console.log(err)
})

//global midware

app.set("view engine", "ejs")
app.use(express.urlencoded({extended:true}))
app.use(express.json())

app.use(session({
  secret : process.env.secret_key,
  store : STORE,
  resave : false,
  saveUninitialized : false
}))

app.use(express.static("public")) //middelware to make a file static

//api
app.get("/",(req,res)=>{
  return res.send(" server is up and running")
})

app.get("/register",(req,res)=>{
  res.render("register_page")
})


app.post("/register",async(req,res)=>{
  
  const{name,email,username,password} = req.body

  //data validation
  try {
   await userDataValidate({name,email,username,password})

  } catch (error) {
    return res.status(400).json(error)
  }
  

  try {

    const userEmailExist = await userModel.findOne({email:email})

    if(userEmailExist){
      return res.status(400).json("user email is already exist")
    }

    const userNameExist = await userModel.findOne({username : username});

    if(userNameExist){
      return res.status(400).json("username is already exist")
    }


    //password hashing
  const encryptPw = await bcrypt.hash(password,Number(process.env.salt))
  
  const userObj = new userModel({
    name : name,
    email : email,
    username : username,
    password : encryptPw
  })


    const userDB = await userObj.save()
    return res.redirect("/login")

    //return res.status(201).json("register sucessful")
  } catch (error) {
    return res.status(500).json("inetrnal error")
  }

})

app.get("/login",(req,res)=>{
  res.render("login_page")
})

app.post("/login",async (req,res)=>{

  
  
 const{loginId,password } = req.body;
 if(!loginId && !password){
  return res.send("user's log in credential is missing")
 }
 try {
  //find the user data with the log in id --it could be email or username so need to check 
  let userDB;
  if(isEmailValidate({key : loginId})){
    userDB =  await userModel.findOne({email : loginId})
    
  }else{
    userDB =  await userModel.findOne({username : loginId})
    
  }
  
  if(!userDB){
    return res.status(400).json("user is not found , register yourself")
  }

  const passwordChecked = await bcrypt.compare(password,userDB.password)

 if(!passwordChecked){
  return res.status(400).json("your password is wrong")
 }
 req.session.isAuth = true;
 req.session.user = {
 id : userDB._id,
 username : userDB.username,
 email : userDB.email
 }

 
 return res.redirect("/dashboard")
 
 //return res.status(200).json("you are sucessfully loged in")
  
 } catch (error) {
  
  return res.status(500).json(error)
 }

 
})

app.get("/dashboard",isAuth,(req,res)=>{
 return res.render("dashboardPage")
})

app.post("/logout", isAuth, (req, res) => {
  req.session.destroy((err) => {
    if (err) {
    
      return res.status(500).json("Failed to log out");
    }
    
    return res.redirect("/login");
  });
});

app.post("/logout-out-from-all",isAuth, async (req,res)=>{

  //create schema

  const sessionSchema = new mongoose.Schema({_id:String},{strict : false})

  //convert into model

  const sessionModel = mongoose.models.session || mongoose.model("session",sessionSchema)

  
  const username = req.session.user.username
  try {
    await sessionModel.deleteMany({"session.user.username" : username})
    return res.redirect("/login")
    
  } catch (error) {
    return res.status(500).json(error)
  }
  
  
  
  
})

app.post("/create-item",isAuth, async(req,res)=>{
 
  const {todo} = req.body;
  const username = req.session.user.username

  try {
    
     await todoValidation({todo})
  } catch (error) {
    return res.status(400).json(error)
  }

  
  try {
    const todoObj = new todoModel({
      todo : todo,
      username : username
    })

    const todoDB = await todoObj.save()

    return res.status(201).json({
      message : "todo add sucessfully",
     data : todoDB}
    )
    
  } catch (error) {
    return res.status(500).json({
      message : "internal error",
     data : error}
    )
    }

  
}) 

app.get("/read-todo",isAuth,async (req,res)=>{
  
  const SKIP = Number(req.query.skip) || 0; //should be typecast becoz come as string
  
  const LIMIT = 2;

  const username = req.session.user.username;
 try {
  //const todos = await todoModel.find({username : username})

  const todos = await todoModel.aggregate([{$match : {username : username}},{$skip : SKIP},{$limit : LIMIT }])

  if(todos.length === 0) return res.status(204).json("Add your todo first")

  return res.status(200).json({
    message : `todo of ${username}`,
    data : todos
  })
 } catch (error) {
  return res.send(400).json(error)
 }
  
})



app.post("/edit-item", isAuth, async (req, res) => {
  const { todoId, newData } = req.body;
  const username = req.session.user.username;

  

  try {
    await todoValidation({ todo: newData });
  } catch (error) {
    return res.send({
      status: 400,
      message: error,
    });
  }

  //find the todo

  try {
    //ownership check
    const todoDb = await todoModel.findOne({ _id: todoId });

    if (username !== todoDb.username)
      return res.send({
        status: 403,
        message: "Not allow to edit this todo",
      });

    //update the todo
    const todoDbNew = await todoModel.findOneAndUpdate(
      { _id: todoId },
      { todo: newData },
      { new: true }
    );

    return res.send({
      status: 200,
      message: "Todo updated successfully",
      data: todoDbNew,
    });
  } catch (error) {
    console.log(error);
    return res.send({
      status: 500,
      message: "Internal server error",
      error: error,
    });
  }
});

app.post("/delete-todo",isAuth,async(req,res)=>{
   const username = req.session.user.username;

   const{todoId} = req.body

   try {
    const ownership = await todoModel.findOne({_id : todoId})
    if(username !== ownership.username) return res.status(403).json("you are not autherized to do this function")

      await todoModel.deleteOne({_id : todoId})

      return res.status(200).json("delete sucessfull")

   } catch (error) {
    return res.status(500).json("internal error")
   }
})



//create server
app.listen(port,()=>{
  console.log(`server is up and running at http://localhost:${port}`)
})