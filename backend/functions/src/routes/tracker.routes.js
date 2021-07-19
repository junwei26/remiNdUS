module.exports = (app) => {
  const tracker = require("../controllers/tracker.controller.js");

  var router = require("express").Router();

  router.post("/create", tracker.create);

  router.get("/", tracker.getAll);

  app.use("/api/tracker", router);
};
