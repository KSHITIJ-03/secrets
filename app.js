const express = require("express")
const bodyParser = require("body-parser")
const ejs = require("ejs")
const mongoose = require("mongoose")
const encryption = require("mongoose-encryption")
const app = express()

app.use(express.static("public"))
app.set("view engine", "ejs")
app.use(bodyParser.urlencoded({extended: true}))

mongoose.connect("mongodb://127.0.0.1:27017/userDB", {useNewUrlParser: true})

const userSchema = new mongoose.Schema({
  email: String,
  password: String
})

const secret = "bitchesintheroom"

userSchema.plugin(encryption, {secret: secret, encryptedFields: ["password"]})

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
  const username = req.body.username
  const password = req.body.password
  const newUser = new user({
    email: username,
    password: password
  })
  newUser.save()
  console.log("user successfully registered");
  res.render("secrets")
})

app.post("/login", (req, res)=>{
  const username = req.body.username
  const password = req.body.password
  user.findOne({email: username}).then((data)=>{
    if(data){
      console.log(data);
      if(data.password == password){
        res.render("secrets")
      }
      else{
        res.send("wrong password")
      }
    }
    else{
      res.send("user not found")
    }
  })
})
