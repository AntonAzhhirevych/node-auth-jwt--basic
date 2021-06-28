const Joi = require('@hapi/joi');

const userSignup = (data) => {
  const schema = Joi.object({
    name: Joi.string().min(2).max(255).required(),
    surname: Joi.string().min(2).max(255).required(),
    email: Joi.string().min(6).max(255).required(),
    password: Joi.string().min(6).max(1024).required(),
  });

  return schema.validate(data);
};

const userSignin = (data) => {
  const schema = Joi.object({
    email: Joi.string().min(6).max(255).required(),
    password: Joi.string().min(6).max(1024).required(),
  });

  return schema.validate(data);
};

module.exports.userSignup = userSignup;
module.exports.userSignin = userSignin;
