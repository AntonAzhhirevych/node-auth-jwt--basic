// const { } = require("./news.service");


function getAllNewsController(req, res) {
  return res.json({
    posts: {
      title: 'hello',
      description: 'world',
    },
  });
}


module.exports = {
  getAllNewsController
};