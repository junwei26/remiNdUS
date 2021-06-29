module.exports = (app) => {
  const reminderPackages = require("../controllers/reminderpackages.controller.js");

  var router = require("express").Router();

  router.get("/", reminderPackages.getAll);
  router.get("/getpublic", reminderPackages.getPublicPackages);

  router.post("/create", reminderPackages.create);
  router.post("/share", reminderPackages.share);
  router.post("/subscribe", reminderPackages.subscribe);

  router.delete("/delete", reminderPackages.delete);

  app.use("/api/reminderpackages", router);
};
