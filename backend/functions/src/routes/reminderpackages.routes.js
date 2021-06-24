module.exports = (app) => {
  const user = require("../controllers/reminderpackages.controller.js");

  var router = require("express").Router();

  router.post("/create", user.create);

  router.get("/", user.get);

  app.use("/api/reminderpackages", router);
};
