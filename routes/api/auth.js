const express = require("express");
// require("dotenv").config();
const router = express.Router();
const db = require("../../models/index");
const { check } = require("express-validator");
const passport = require("passport");
const { Strategy: GoogleStrategy } = require("passport-google-oauth20");
const {
  registerUser,
  loginUser,
  registerLoginUserWithGoogle,
} = require("../../controllers/auth.controller");

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "/auth/google/callback",
    },
    registerLoginUserWithGoogle
  )
);

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findByPk(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

//@route    POST api/auth
//@desc     Authenticate user and get token
//@access   public
const validateLogin = [
  check("email", "Please include a valid email").isEmail(),
  check("password", "Password is required").not().isEmpty(),
];
router.post("/login", validateLogin, loginUser);

//@route    POST api/auth
//@desc     create user and get token
//@access   public
const validateSignup = [
  check("email", "Please include a valid email")
    .isEmail()
    .withMessage("Must be a valid email address"),
  check("password", "Password is required")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters long"),
];

// Sign up with email and password
router.post("/signup", validateSignup, registerUser);

// sign up with google
router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

router.get(
  "/google/callback",
  passport.authenticate("google", { failureRedirect: "/" }),
  (req, res) => {
    const { token } = req.authInfo; // Get the token from authInfo
    // Successful authentication, redirect home with token.
    res.redirect(`${process.env.FRONT_END_URL}?token=${token}`);
  }
);

router.get("/logout", (req, res, next) => {
  req.logout((err) => {
    if (err) {
      return next(err);
    }
    res.redirect(process.env.FRONT_END_URL);
  });
});

module.exports = router;
