const { signupService, signinService, updateTokenService } = require("./auth.service");


function signupController(req, res) {

  return signupService(req.body)
    .then((data) => res.status(200).json(data))
    .catch(({ message }) => {
      res.status(400).json({ error: message });
    });
}


function signinController(req, res) {

  return signinService(req.body)
    .then((data) => res.status(200).json(data))
    .catch(({ message }) => {
      res.status(400).json({ error: message });
    });
}

function updateTokenController(req, res) {

  return updateTokenService(req.body)
    .then((data) => res.status(200).json(data))
    .catch(({ message }) => {
      res.status(400).json({ error: message });
    });
}



module.exports = {
  signupController,
  signinController,
  updateTokenController
};