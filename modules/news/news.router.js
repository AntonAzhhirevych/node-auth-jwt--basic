const router = require('express').Router();
const verify = require('../../middlewares/verifyToken');


const {
  getAllNewsController
} = require("./news.controller");


router.get("/news", verify, getAllNewsController);




module.exports = router;