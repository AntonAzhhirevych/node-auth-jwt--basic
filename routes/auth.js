const router = require('express').Router();
const User = require('../models/User');
const RefreshToken = require('../models/RefreshToken');
const config = require("../configs/auth.config");

const { userSignup, userSignin } = require('../schemas/user');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

router.post('/signup', async (req, res) => {
  //validation
  const { error } = userSignup(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  //checking if the user is already in the db
  const emailExist = await User.findOne({ email: req.body.email });
  if (emailExist) return res.status(400).send('email already exist');

  //hash passwords
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(req.body.password, salt);

  //create new user
  const user = new User({
    name: req.body.name,
    surname: req.body.surname,
    email: req.body.email,
    password: hashedPassword,
  });

  try {
    const savedUser = await user.save();
    res.status(200).send(savedUser);
  } catch (err) {
    res.status(400).send(err);
  }
});

router.post('/signin', async (req, res) => {
  //validation
  const { error } = userSignin(req.body);
  if (error) return res.status(400).send(error.details[0].message);
  //check if the email exist
  const user = await User.findOne({ email: req.body.email });
  if (!user) return res.status(400).send('Email already exist!');
  //check password is correct
  //compare = сравнивать
  const validPass = await bcrypt.compare(req.body.password, user.password);
  if (!validPass) return res.status(400).send('Invalid password!');

  //create and assign(назначать) token

  let accessToken = jwt.sign({ _id: user._id }, process.env.TOKEN_SECRET, {
    expiresIn: config.jwtExpiration,
  });
  const refreshToken = await RefreshToken.createToken(user);

  res.header('auth-token', accessToken).send({ accessToken: accessToken, refreshToken: refreshToken });
});



router.post('/update-token', async (req, res) => {
  const { refreshToken: requestToken } = req.body;

  if (requestToken == null) {
    return res.status(403).json({ message: "Refresh Token is required!" });
  }

  try {
    let refreshToken = await RefreshToken.findOne({ token: requestToken });

    if (!refreshToken) {
      res.status(403).json({ message: "Refresh token is not in database!" });
      return;
    }

    if (RefreshToken.verifyExpiration(refreshToken)) {
      RefreshToken.findByIdAndRemove(refreshToken._id, { useFindAndModify: false }).exec();

      res.status(403).json({
        message: "Refresh token was expired. Please make a new signin request",
      });
      return;
    }

    let newAccessToken = jwt.sign({ _id: refreshToken.user._id }, process.env.TOKEN_SECRET, {
      expiresIn: config.jwtExpiration,
    });

    return res.status(200).json({
      accessToken: newAccessToken,
      refreshToken: refreshToken.token,
    });
  } catch (err) {
    return res.status(500).send({ message: err });
  }
})

module.exports = router;
