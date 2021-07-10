module.exports = (app) => {
  const telegramBot = require("../controllers/telegramBot.controller.js");

  var router = require("express").Router();

  router.get("/", telegramBot.sendReminders);

  app.use("/api/telegramBot", router);
};
