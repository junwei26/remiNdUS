module.exports = (app) => {
  const reminders = require("../controllers/reminder.controller.js");

  var router = require("express").Router();

  // Fetch all reminders of a specified user for a specified date
  router.get("/", reminders.getAll);

  app.use("/api/reminder", router);
};
