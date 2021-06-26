module.exports = (app) => {
  const reminderPackages = require("../controllers/reminderpackages.controller.js");

  var router = require("express").Router();

  router.post("/create", reminderPackages.create);

  router.get("/", reminderPackages.getAll);

  router.delete("/delete", reminderPackages.delete);

  app.use("/api/reminderpackages", router);
};
