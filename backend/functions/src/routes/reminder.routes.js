module.exports = (app) => {
  const reminders = require("../controllers/reminder.controller.js");

  var router = require("express").Router();

  // Fetch all reminders of a specified user for a specified date
  router.get("/", reminders.getAll);
  router.get("/get", reminders.get);
  router.get("/getSubscribed", reminders.getSubscribed);

  // Creates a new reminder for a specified user
  router.post("/create", reminders.create);
  router.post("/update", reminders.update);
  router.delete("/", reminders.delete);
  router.get("/getRange", reminders.range);
  app.use("/api/reminder", router);
};
