require("dotenv").config()
const express = require("express")
const bodyParser = require("body-parser")
const ejs = require("ejs")
const mongoose = require("mongoose")
const encryption = require("mongoose-encryption")
//const md5 = require("md5")

// const bcrypt = require("bcrypt")
// const saltRounds = 10

const session = require("express-session")
const passport = require("passport")
const passportLocalMongoose = require("passport-local-mongoose")

const app = express()

app.use(express.static("public"))
app.set("view engine", "ejs")
app.use(bodyParser.urlencoded({extended: true}))

app.use(session({
  secret: "our little secret",
  resave: false,
  saveUninitialized: false
}))

app.use(passport.initialize())
app.use(passport.session())

mongoose.connect("mongodb://127.0.0.1:27017/userDB", {useNewUrlParser: true})
//mongoose.set("useCreateIndex", true)

const userSchema = new mongoose.Schema({
  email: String,
  password: String
})

userSchema.plugin(passportLocalMongoose)

// userSchema.plugin(encryption, {secret: process.env.SECRET, encryptedFields: ["password"]})

const user = new mongoose.model("user", userSchema)

passport.use(user.createStrategy())
passport.serializeUser(user.serializeUser())
passport.deserializeUser(user.deserializeUser())

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

app.get("/secrets", (req, res)=>{
  if(req.isAuthenticated()){
    res.render("secrets")
  }else{
    res.redirect("/login")
  }
})

app.get("/logout", (req, res)=>{
  req.logout((err)=>{
    if(err) console.log(err)
    else res.redirect("/")
  })
})

app.post("/register", (req, res)=>{
  // bcrypt.hash(req.body.password, saltRounds).then((data)=>{
  //   const username = req.body.username
  //   const password = data
  //   console.log(data)
  //   const newUser = new user({
  //     email: username,
  //     password: password
  //   })
  //   newUser.save()
  //   console.log("user successfully registered");
  //   res.render("secrets")
  // })

  user.register({username: req.body.username}, req.body.password, (err, user)=>{
    if(err){
      console.log(err)
      res.redirect("/register")
    }
    else{
      passport.authenticate("local")(req, res, ()=>{
        res.redirect("/secrets")
      })
    }
  })
})

app.post("/login", (req, res)=>{
  // const username = req.body.username
  // const password = req.body.password
  // user.findOne({email: username}).then((data)=>{
  //   if(data){
  //     //console.log(data);
  //     bcrypt.compare(password, data.password).then((result)=>{
  //       if(result === true){
  //         res.render("secrets")
  //       }else{
  //         res.send("wrong password")
  //       }
  //     }).catch((err)=>{
  //       console.log(err);
  //     })
  //   }else{
  //     res.send("user not found")
  //   }
  // })

  const newUser = new user({
    username: req.body.username,
    password: req.body.password
  })
  req.login(newUser, (err)=>{
    if(err){
      console.log(err)
    }
    else{
      passport.authenticate("local")(req, res, ()=>{
        res.redirect("/secrets")
      })
    }
  })
})
