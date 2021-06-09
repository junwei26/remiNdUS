module.exports = (app) => {
  const reminders = require("../controllers/reminder.controller.js");

  var router = require("express").Router();

  // Fetch all reminders of a specified user for a specified date
  router.get("/", reminders.getAll);

  // Creates a new reminder for a specified user
  router.post("/create", reminders.create);

  app.use("/api/reminder", router);
};
