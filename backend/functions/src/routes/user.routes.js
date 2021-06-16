module.exports = (app) => {
  const user = require("../controllers/user.controller.js");

  var router = require("express").Router();

  router.post("/create", user.create);
  router.post("/update", user.update);
  router.post("/updateTiming", user.updateTiming);

  router.get("/", user.get);

  app.use("/api/user", router);
};
