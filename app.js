require("dotenv").config()
const express = require("express")
const bodyParser = require("body-parser")
const ejs = require("ejs")
const mongoose = require("mongoose")
const encryption = require("mongoose-encryption")
//const md5 = require("md5")
const bcrypt = require("bcrypt")
const saltRounds = 10
const app = express()

app.use(express.static("public"))
app.set("view engine", "ejs")
app.use(bodyParser.urlencoded({extended: true}))

mongoose.connect("mongodb://127.0.0.1:27017/userDB", {useNewUrlParser: true})

const userSchema = new mongoose.Schema({
  email: String,
  password: String
})

// userSchema.plugin(encryption, {secret: process.env.SECRET, encryptedFields: ["password"]})

const user = new mongoose.model("user", userSchema)

app.listen(3000, ()=>{
  console.log("server started at port 3000");
})

app.get("/", (req, res)=>{
  res.render("home")
})
app.get("/login", (req, res)=>{
  res.render("login")
})
app.get("/register", (req, res)=>{

  res.render("register")
})

app.post("/register", (req, res)=>{
  bcrypt.hash(req.body.password, saltRounds).then((data)=>{
    const username = req.body.username
    const password = data
    console.log(data)
    const newUser = new user({
      email: username,
      password: password
    })
    newUser.save()
    console.log("user successfully registered");
    res.render("secrets")
  })

})

app.post("/login", (req, res)=>{
  const username = req.body.username
  const password = req.body.password
  user.findOne({email: username}).then((data)=>{
    if(data){
      //console.log(data);
      bcrypt.compare(password, data.password).then((result)=>{
        if(result === true){
          res.render("secrets")
        }else{
          res.send("wrong password")
        }
      }).catch((err)=>{
        console.log(err);
      })
    }else{
      res.send("user not found")
    }
  })
})
