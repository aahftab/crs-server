const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
const session = require("express-session");
var passport = require("passport");
var crypto = require("crypto");
var routes = require("./routes");
const connection = require("./config/database");
const cors = require("cors");
// Package documentation - https://www.npmjs.com/package/connect-mongo
const MongoStore = require("connect-mongo");

/**
 * -------------- GENERAL SETUP ----------------
 */

// Gives us access to variables set in the .env file via `process.env.VARIABLE_NAME` syntax
require("dotenv").config();

// Create the Express application
var app = express();
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, '/uploads')));
/**
 * -------------- SESSION SETUP ----------------
 */
function myFunction() {
  console.log(connection);
  app.use(
    session({
      secret: process.env.SECRET,
      resave: false,
      saveUninitialized: true,
      store: MongoStore.create({
        client: connection.getClient(),
        collectionName: "sessions",
      }),
      cookie: {
        maxAge: 1000 * 60 * 60 * 24, // Equals 1 day (1 day * 24 hr/1 day * 60 min/1 hr * 60 sec/1 min * 1000 ms / 1 sec)
      },
    })
  );

  /**
   * -------------- PASSPORT AUTHENTICATION ----------------
   */

  // Need to require the entire Passport config module so app.js knows about it
  require("./config/passport");

  app.use(passport.initialize());
  app.use(passport.session());

  app.use((req, res, next) => {
    console.log(req.session);
    console.log(req.user);
    next();
  });

  /**
   * -------------- ROUTES ----------------
   */

  // Imports all of the routes from ./routes/index.js
  app.use(routes);

  /**
   * -------------- SERVER ----------------
   */
  // Server listens on http://localhost:3000
  app.listen(process.env.PORT, () => {
    console.log(`Server is running on http://localhost:${process.env.PORT}`);
  });
}

// Call `setTimeout` with the function and delay in milliseconds
setTimeout(myFunction, 100); // 5000 milliseconds equals 5 seconds
