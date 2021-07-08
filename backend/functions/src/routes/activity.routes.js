module.exports = (app) => {
  const activities = require("../controllers/activity.controller.js");

  var router = require("express").Router();

  router.get("/", activities.getAll);

  router.get("/get", activities.get);

  router.get("/getByTelegram", activities.getByTelegram);

  router.post("/createByTelegram", activities.createByTelegram);

  router.post("/create", activities.create);

  router.post("/update", activities.update);

  router.delete("/", activities.delete);

  router.get("/getRange", activities.range);

  app.use("/api/activity", router);
};
