module.exports = (app) => {
  const user = require("../controllers/user.controller.js");

  var router = require("express").Router();

  router.post("/create", user.create);
  router.post("/update", user.update);
  router.post("/updateUsername", user.updateUsername);
  router.post("/updateTelegramHandle", user.updateTelegramHandle);
  router.post("/updateTelegramSendReminders", user.updateTelegramSendReminders);
  router.post("/updateTelegramReminderTiming", user.updateTelegramReminderTiming);

  router.get("/", user.get);

  app.use("/api/user", router);
};
