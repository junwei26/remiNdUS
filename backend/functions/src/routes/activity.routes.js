module.exports = (app) => {
  const activities = require("../controllers/activity.controller.js");

  var router = require("express").Router();

  router.get("/", activities.getAll);
  router.get("/get", activities.get);
  router.get("/template", activities.getTemplateActivities);
  router.get("/getByTelegram", activities.getByTelegram);
  router.get("/getRange", activities.range);

  router.post("/createByTelegram", activities.createByTelegram);

  router.post("/create", activities.create);
  router.post("/update", activities.update);

  router.delete("/", activities.delete);

  app.use("/api/activity", router);
};
