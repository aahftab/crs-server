const router = require("express").Router();
const passport = require("passport");
const genPassword = require("../lib/passwordUtils").genPassword;
const connection = require("../config/database");
const User = connection.models.User;
const Complaint = connection.models.Complaint;
const News = connection.models.News;
const isAuth = require("./authMiddleware").isAuth;
const isAdmin = require("./authMiddleware").isAdmin;
const multer = require("multer");
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});
const upload = multer({ storage: storage });

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
  const saltHash = genPassword(req.body.password);

  const salt = saltHash.salt;
  const hash = saltHash.hash;

  const newUser = new User({
    username: req.body.username,
    hash: hash,
    salt: salt,
    admin: false,
  });

  newUser
    .save()
    .then((user) => {
      console.log(user);
      res.status(200).send("User created");
    })
    .catch((err) => {
      console.log(err);
      res.status(400).json({ msg: "Error creating user" });
    });
});

router.post("/registerComplaint", isAuth, (req, res, next) => {
  req.body.username = req.user.username;
  const newComplaint = new Complaint(req.body);
  newComplaint
    .save()
    .then((complaint) => {
      console.log(complaint);
      res.status(200).json({ msg: "Complaint registered" });
    })
    .catch(() => {
      res.status(400).json({ msg: "Error registering complaint" });
    });
});

router.post("/postNews",  isAdmin, upload.single("image"), (req, res, next) => {
  const newNews = new News({
    title: req.body.title,
    description: req.body.description,
    date: new Date(),
    imageName: req.file.filename,
  });
  newNews
    .save()
    .then((news) => {
      console.log(news);
      res.status(200).json({ msg: "News posted" });
    })
    .catch(() => {
      res.status(400).json({ msg: "Error posting news" });
    });
});

router.get("/fetchNews", async (req, res, next) => {
  await News.find()
    .then((news) => {
      res.json(news)
    })
    .catch(() => {
      res.status(400).json({ msg: "Error fetching news" });
    });
});
router.get("/fetchComplaints", isAuth, async (req, res, next) => {
  await Complaint.find({ username: req.user.username })
    .then((complaints) => {
      res.send(complaints);
    })
    .catch(() => {
      res.status(400).json({ msg: "Error fetching complaints" });
    });
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
  res.status(200).json({ mesage: "You successfully logged in." });
  
});

router.get("/login-failure", (req, res, next) => {
  res.status(401).json({ message: "You entered the wrong password." });
});

module.exports = router;
