const { app } = require("../dist/index.mjs");

module.exports = (req, res) => {
  return app(req, res);
};

