//import
const express = require("express");
const mongoose = require("mongoose");
require('dotenv').config()
console.log(process.env.port) 


//file-imports
const { userDataValidate } = require("./utils/dataValidation");
const userModel = require("./models/userModel");

//constants

const app = express();
const port = process.env.port || 8000 
const db_uri = process.env.dataBaseUrl

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

  const userObj = new userModel({
    name : name,
    email : email,
    username : username,
    password : password
  })

  try {
    const userDB = await userObj.save()

    return res.status(201).json("register sucessful")
  } catch (error) {
    return res.status(500).json("inetrnal error")
  }

  return res.send("all ok")
})

app.get("/login",(req,res)=>{
  res.render("login_page")
})



//create server
app.listen(port,()=>{
  console.log(`server is up and running at http://localhost:${port}`)
})