module.exports = (app) => {
  const reminderPackages = require("../controllers/reminderpackages.controller.js");

  var router = require("express").Router();

  router.get("/", reminderPackages.getAll);

  router.post("/create", reminderPackages.create);

  router.delete("/delete", reminderPackages.delete);

  app.use("/api/reminderpackages", router);
};
