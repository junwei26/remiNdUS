module.exports = (app) => {
  const activities = require("../controllers/activity.controller.js");

  var router = require("express").Router();

  router.post("/create", activities.create);

  router.get("/", activities.getAll);

  app.use("/api/activity", router);
};
