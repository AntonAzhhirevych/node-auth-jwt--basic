const router = require('express').Router();

const {
  signupController,
  signinController,
  updateTokenController
} = require("./auth.controller");


router.post("/signup", signupController);
router.post("/signin", signinController);
router.post("/update-token", updateTokenController);







module.exports = router;