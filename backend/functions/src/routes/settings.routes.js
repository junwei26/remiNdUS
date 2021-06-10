module.exports = (app) => {
  const settings = require("../controllers/settings.controller.js");

  var router = require("express").Router();

  router.post("/create", settings.create);

  router.get("/", settings.get);

  app.use("/api/settings", router);
};
