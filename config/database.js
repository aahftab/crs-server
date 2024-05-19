const mongoose = require("mongoose");

require("dotenv").config();

/**
 * -------------- DATABASE ----------------
 */

/**
 * Connect to MongoDB Server using the connection string in the `.env` file.  To implement this, place the following
 * string into the `.env` file
 *
 * DB_STRING=mongodb://<user>:<password>@localhost:27017/database_name
 */

const conn = process.env.DB_STRING;

const connection = mongoose.createConnection(conn);

// Creates simple schema for a User.  The hash and salt are derived from the user's given password when they register
const UserSchema = new mongoose.Schema({
  username: String,
  hash: String,
  salt: String,
  admin: Boolean,
});

const ComplaintSchema = new mongoose.Schema({
  username: String,
  email: String,
  phone: String,
  name: String,
  gender: String,
  complaintType: String,
  date: Date,
  time: String,
  state: String,
  district: String,
  location: String,
  description: String,
  suspects: [{ suspectName: String, suspectAddress: String }],
});

const NewsSchema = new mongoose.Schema({
  title: String,
  description: String,
  date: Date,
  imageName: String,
});

const News = connection.model("News", NewsSchema);

const Complaint = connection.model("Complaint", ComplaintSchema);

const User = connection.model("User", UserSchema);

// Expose the connection
module.exports = connection;
