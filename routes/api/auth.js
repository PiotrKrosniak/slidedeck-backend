const express = require("express");
const router = express.Router();
const db = require("../../models/index");
const { check } = require("express-validator");
const passport = require("passport");
const { Strategy: GoogleStrategy } = require("passport-google-oauth20");
const { registerUser, loginUser } = require("../../controllers/auth.controller");

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "/auth/google/callback",
    },
    async (token, tokenSecret, profile, done) => {
      try {
        let user = await db.User.findOne({
          where: { email: profile.emails[0].value },
        });
        console.log('useruser', user);
        if (!user) {
          user = await db.User.create({
            email: profile.emails[0].value,
            user_name: profile.displayName,
            user_type: "free",
            credits: 0,
            storage_used: 0,
            storage_free: 0,
          });
        }

        return done(null, user);
      } catch (error) {
        return done(error, false);
      }
    }
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
    // Successful authentication, redirect home.
    res.redirect("http://localhost:3000");
  }
);

router.get("/logout", (req, res, next) => {
  req.logout((err) => {
    if (err) {
      return next(err);
    }
    res.redirect("http://localhost:3000");
  });
});

module.exports = router;
