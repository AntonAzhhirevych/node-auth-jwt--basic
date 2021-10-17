
const { userSignupValidate, userSigninValidate } = require('./auth.validate');

const {
  RefreshToken,
  User
} = require('./auth.model')

const config = require("../../configs/auth.config");

const { Error } = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');







async function signupService(data) {

  //validation
  const { error } = userSignupValidate(data);

  if (error) throw new Error(error.details[0].message);

  //checking if the user is already in the db
  const emailExist = await User.findOne({ email: data.email });
  if (emailExist) throw new Error('email already exist');

  //hash passwords
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(data.password, salt);


  //create new user
  const user = new User({
    name: data.name,
    surname: data.surname,
    email: data.email,
    password: hashedPassword,
  });


  try {
    const savedUser = await user.save();
    return savedUser
  } catch (err) {
    throw err
  }
}





async function signinService(data) {
  //validation
  const { error } = userSigninValidate(data);
  if (error) throw new Error(error.details[0].message);
  //check if the email exist
  const user = await User.findOne({ email: data.email });
  if (!user) throw new Error('Email already exist!');
  //check password is correct
  //compare = сравнивать
  const validPass = await bcrypt.compare(data.password, user.password);
  if (!validPass) throw new Error('Invalid password!');

  //create and assign token

  try {
    const accessToken = jwt.sign({ _id: user._id }, process.env.TOKEN_SECRET, {
      expiresIn: config.jwtExpiration,
    });
    const refreshToken = await RefreshToken.createToken(user);

    return { accessToken: accessToken, refreshToken: refreshToken }
  } catch (error) {
    throw error
  }
}


async function updateTokenService(data) {
  const { refreshToken: requestToken } = data;

  if (requestToken == null) throw new Error("Refresh Token is required!")

  let refreshToken = await RefreshToken.findOne({ token: requestToken });

  if (!refreshToken) throw new Error("Refresh token is not in database!")

  if (RefreshToken.verifyExpiration(refreshToken)) {
    RefreshToken.findByIdAndRemove(refreshToken._id, { useFindAndModify: false }).exec();

    throw new Error("Refresh token was expired. Please make a new signin request");
  }

  let newAccessToken = jwt.sign({ _id: refreshToken.user._id }, process.env.TOKEN_SECRET, {
    expiresIn: config.jwtExpiration,
  });

  try {
    return {
      accessToken: newAccessToken,
      refreshToken: refreshToken.token,
    }

  } catch (error) {
    throw error
  }
}



module.exports = {
  signupService,
  signinService,
  updateTokenService
};