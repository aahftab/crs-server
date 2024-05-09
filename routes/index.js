const router = require("express").Router();
const passport = require("passport");
const genPassword = require("../lib/passwordUtils").genPassword;
const connection = require("../config/database");
const User = connection.models.User;
const Complaint = connection.models.Complaint;
const isAuth = require("./authMiddleware").isAuth;
const isAdmin = require("./authMiddleware").isAdmin;

/**
 * -------------- POST ROUTES ----------------
 */

router.post(
  "/login",
  passport.authenticate("local", {
    failureRedirect: "/login-failure",
    successRedirect: "/login-success",
  })
);

router.post("/register", (req, res, next) => {
  console.log(req.body);
  const saltHash = genPassword(req.body.pw);

  const salt = saltHash.salt;
  const hash = saltHash.hash;

  const newUser = new User({
    username: req.body.uname,
    hash: hash,
    salt: salt,
    admin: false,
  });

  newUser.save().then((user) => {
    console.log(user);
  });
  console.log("User created \n", newUser);
  res.json({ msg: "User created" });
});
function createComplaint(req, res, next) {
  req.body.username = req.user.username;
  next();
}
router.post("/registerComplaint", isAuth, createComplaint, (req, res, next) => {
  const newComplaint = new Complaint(req.body);
  newComplaint.save().then((complaint) => {
    console.log(complaint);
  });
});

router.get("/fetchComplaints", isAuth, async(req, res, next) => {
 await Complaint.find({ username: req.user.username }).then((complaints) => {
      res.send(complaints);
  });
});
router.get("/protected-route", isAuth, (req, res, next) => {
  res.send("You made it to the route.");
  console.log("protected route");
  console.log(req.session);
  console.log(req.user);
});

router.get("/admin-route", isAdmin, (req, res, next) => {
  res.send("You made it to the admin route.");
});

router.get("/logout", function (req, res, next) {
  req.logout(function (err) {
    if (err) {
      console.error(err);
      res.send(err);
    } else {
      res.status(200).clearCookie("connect.sid", {
        path: "/",
      });
      req.session.destroy(function (err) {
        res.send("You have been logged out.");
      });
    }
  });
});
router.get("/login-success", (req, res, next) => {
  res.send("Login Successful");
});

router.get("/login-failure", (req, res, next) => {
  res.send("You entered the wrong password.");
});

module.exports = router;
