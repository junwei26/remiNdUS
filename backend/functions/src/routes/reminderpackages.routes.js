module.exports = (app) => {
  const user = require("../controllers/reminderpackages.controller.js");

  var router = require("express").Router();

  router.post("/create", user.create);

  router.get("/", user.getAll);

  app.use("/api/reminderpackages", router);
};
