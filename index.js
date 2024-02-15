import express from "express";
import path from "path";
import mongoose from "mongoose";
import cookieParser from "cookie-parser";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { domainToASCII } from "url";

mongoose
  .connect("mongodb://127.0.0.1:27017", {
    dbName: "backend",
  })
  .then(() => console.log("Users Database Connected"))
  .catch((e) => console.log(e));
const userSchema = new mongoose.Schema({
  email: String,
  password: String,
});

const User = mongoose.model("User", userSchema);

const app = express();

app.use(express.static(path.join(path.resolve(), "public")));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());


app.set("view engine", "ejs");

const isAuthenticated = async (req, res, next) => {
  const { token } = req.cookies;
  if (token) {
    const decoded = jwt.verify(token, "sdjasdbajsdbjasd");

    req.user = await User.findById(decoded._id);

    next();
  } else {
    res.redirect("/login");
  }
};

app.get("/", isAuthenticated, (req, res) => {
  res.render("logout", { name: req.user.name });
});

app.get("/login", (req, res) => {
  res.render("login");
});

app.get("/register", (req, res) => {
  res.render("register");
});

app.get("/home", (req, res) => {
  res.render("home");
});

app.get("/new-event", (req, res) => {
  res.render("new-event.ejs");
});

app.get("/add-event", (req, res) => {
  res.render("add-event.ejs");
});

app.get("/registered_events", (req, res) => {
  res.render("registered_events.ejs");
});


app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  let user = await User.findOne({ email });

  if (!user) return res.redirect("/register");

  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch)
    return res.render("login", { email, message: "Incorrect Password" });

  const token = jwt.sign({ _id: user._id }, "sdjasdbajsdbjasd");

  res.cookie("token", token, {
    httpOnly: true,
    expires: new Date(Date.now() + 60 * 1000),
  });
  res.redirect("/home");
});

app.post("/register", async (req, res) => {
  const { email, password } = req.body;

  let user = await User.findOne({ email });
  if (user) {
    return res.redirect("/login");
  }
  const hashedPassword = await bcrypt.hash(password, 10);

  user = await User.create({
    email,
    password: hashedPassword,
  });

  const token = jwt.sign({ _id: user._id }, "sdjasdbajsdbjasd");

  res.cookie("token", token, {
    httpOnly: true,
    expires: new Date(Date.now() + 60 * 1000),
  });
  res.redirect("/home");
});

app.get("/logout", (req, res) => {
    res.cookie("token", null, {
      httpOnly: true,
    expires: new Date(Date.now()),
  });
  res.redirect("/");
});

//event 

mongoose
  .connect("mongodb://127.0.0.1:27017", {
    dbName: "backend",
  })
  .then(() => console.log("Event Database Connected"))
  .catch((e) => console.log(e));
const eventSchema = new mongoose.Schema({
  event_name: String,
  description: String,
  host: String,
  date: String,
  time: String
});

const event = mongoose.model("Event", eventSchema);

app.post("/add-event", async (req, res) => {
  const { event_name,description,host,date,time } = req.body;

  event = await event.create({
  event_name,
  description,
  host,
  date,
  time
  });
  
  const token = jwt.sign({ _id: event._id }, "sdjasdbajsdbjasd");

  res.cookie("token", token, {
    httpOnly: true,
    expires: new Date(Date.now() + 60 * 1000),
  });
  res.redirect("/add-event");
});


app.listen(2000, () => {
  console.log("Server is working");
});