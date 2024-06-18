const db = require("../models/index");
const bcrypt = require("bcryptjs");
const { validationResult } = require("express-validator");
const jwt = require("jsonwebtoken");
const s3 = require("../s3Config");

const registerUser = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { email, password } = req.body;
  try {
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);
    const parts = email.split("@");
    const newUser = await db.User.create({
      email,
      user_name: parts?.[0] || "",
      password_hash: passwordHash,
      user_type: "free", // default to 'user' if not provided
      credits: 0,
      storage_used: 0,
      storage_free: 0,
    });

    const folderName = `${newUser.user_id}/`;
    const params = {
      Bucket: process.env.S3_BUCKET_NAME,
      Key: folderName,
      ACL: "private",
    };
    await s3.putObject(params).promise();
    res.status(201).json(newUser);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const loginUser = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { email, password } = req.body;
  try {
    //see if the user exists
    let user = await db.User.findOne({
      where: { email },
    });
    if (!user) {
      return res.status(400).json({ errors: [{ msg: "Invalid credetials" }] });
    }

    //compare password
    const isMatch = await bcrypt.compare(password, user.password_hash);

    if (!isMatch) {
      return res.status(400).json({ errors: [{ msg: "Invalid credetials" }] });
    }

    //Return jsonwebtoken
    const payload = {
      user: {
        id: user.id,
      },
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: 360000 },
      (err, token) => {
        if (err) throw err;
        res.json({ token });
      }
    );
  } catch (err) {
    console.error(err.message);
    res.status(500).send("server error");
  }
};

const registerLoginUserWithGoogle = async (
  token,
  tokenSecret,
  profile,
  done
) => {
  try {
    let user = await db.User.findOne({
      where: { email: profile.emails[0].value },
    });
    if (!user) {
      user = await db.User.create({
        email: profile.emails[0].value,
        user_name: profile.displayName,
        user_type: "free",
        credits: 0,
        storage_used: 0,
        storage_free: 0,
      });
      const folderName = `${user.user_id}/`;
      const params = {
        Bucket: process.env.S3_BUCKET_NAME,
        Key: folderName,
        ACL: "private",
      };
      await s3.putObject(params).promise();
    }
    const payload = {
      user: {
        id: user.id,
      },
    };
    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: 360000,
    });
    return done(null, user, { token });
  } catch (error) {
    return done(error, false);
  }
};

module.exports = {
  registerUser,
  loginUser,
  registerLoginUserWithGoogle,
};
