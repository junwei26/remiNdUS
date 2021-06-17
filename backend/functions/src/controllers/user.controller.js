const admin = require("firebase-admin");
const db = admin.firestore();

exports.create = (req, res) => {
  if (!req.body.uid) {
    return res.status(400).send({
      message: "User ID not successfully created! Contact the Administrator for assistance",
    });
  }

  const settings = {
    uid: req.body.uid,
    username: req.body.username,
    verified: false,
    telegramHandle: req.body.telegramHandle,
    telegramSendReminders: false,
    telegramReminderTiming: "0800",
  };

  db.collection("users")
    .where("uid", "==", req.body.uid)
    .limit(1)
    .get()
    .then((data) => {
      if (!data.empty) {
        return res
          .status(404)
          .send({ message: "Error! User already created. Please contact the administrator" });
      } else {
        db.collection("users")
          .doc(settings.uid)
          .set(settings)
          .then(() => {
            return res.status(200).send({ message: "User database successfully created" });
          })
          .catch((error) => {
            return res.status(400).send({ message: `Error creating user database. ${error}` });
          });
      }
    });
};

exports.update = (req, res) => {
  if (!req.body.uid) {
    return res.status(400).send({ message: "You must be logged in to make this operation!" });
  }
  if (
    !req.body.username ||
    !req.body.telegramHandle ||
    !req.body.telegramSendReminders ||
    !req.body.telegramReminderTiming
  ) {
    return res.status(400).send({ message: "Error! Some required data fields are missing" });
  }

  const updatedSettings = {
    username: req.body.username,
    telegramHandle: req.body.telegramHandle,
    telegramSendReminders: req.body.telegramSendReminders,
    telegramReminderTiming: req.body.telegramReminderTiming,
  };

  db.collection("users")
    .where("uid", "==", req.body.uid)
    .limit(1)
    .get()
    .then((data) => {
      if (data.empty) {
        return res.status(404).send({ message: "No user found. Please contact the administrator" });
      }
      data.forEach((doc) => {
        db.collection("users")
          .doc(doc.id)
          .update(updatedSettings)
          .then(() => {
            return res.status(200).send({ message: "Successfully updated settings!" });
          })
          .catch((error) => {
            return res.status(404).send({ message: `Error updating settings. ${error}` });
          });
      });
    });
};

// helper function for updating individual fields of user settings
const updateSettings = (req, res, updatedSettings, settingNameText) => {
  db.collection("users")
    .where("uid", "==", req.body.uid)
    .limit(1)
    .get()
    .then((data) => {
      if (data.empty) {
        return res.status(404).send({ message: "No user found. Please contact the administrator" });
      }
      data.forEach((doc) => {
        db.collection("users")
          .doc(doc.id)
          .update(updatedSettings)
          .then(() => {
            return res.status(200).send({ message: `Successfully updated ${settingNameText}!` });
          })
          .catch((error) => {
            return res.status(404).send({ message: `Error updating ${settingNameText}. ${error}` });
          });
      });
    })
    .catch((error) => {
      return res.status(404).send({ message: `Cannot find user with given uid. ${error}` });
    });
};

exports.updateUsername = (req, res) => {
  if (!req.body.uid) {
    return res.status(400).send({ message: "You must be logged in to make this operation!" });
  }
  if (!req.body.username) {
    return res.status(400).send({ message: "Error! Missing data." });
  }

  const updatedSettings = {
    username: req.body.username,
  };

  return updateSettings(req, res, updatedSettings, "username");
};

exports.updateTelegramHandle = (req, res) => {
  if (!req.body.uid) {
    return res.status(400).send({ message: "You must be logged in to make this operation!" });
  }
  if (!req.body.telegramHandle) {
    return res.status(400).send({ message: "Error! Missing data." });
  }

  const updatedSettings = {
    telegramHandle: req.body.telegramHandle,
  };

  return updateSettings(req, res, updatedSettings, "telegram handle");
};

exports.updateTelegramSendReminders = (req, res) => {
  if (!req.body.uid) {
    return res.status(400).send({ message: "You must be logged in to make this operation!" });
  }
  if (!req.body.telegramSendReminders) {
    return res.status(400).send({ message: "Error! Missing data." });
  }

  const updatedSettings = {
    telegramSendReminders: req.body.telegramSendReminders,
  };

  return updateSettings(req, res, updatedSettings, "send telegram reminders");
};

exports.updateTelegramReminderTiming = (req, res) => {
  if (!req.body.uid) {
    return res.status(400).send({ message: "You must be logged in to make this operation!" });
  }
  if (!req.body.telegramReminderTiming) {
    return res.status(400).send({ message: "Error! Missing data." });
  }

  const updatedSettings = {
    telegramReminderTiming: req.body.telegramReminderTiming,
  };

  return updateSettings(req, res, updatedSettings, "telegram reminder timing");
};

exports.get = (req, res) => {
  db.collection("users")
    .where("uid", "==", req.query.uid)
    .limit(1)
    .get()
    .then((data) => {
      if (data.empty) {
        return res.status(404).send({ message: "No user found. Please contact the administrator" });
      }
      data.forEach((doc) => {
        db.collection("users")
          .doc(doc.id)
          .get()
          .then((doc) => {
            if (doc.exists) {
              res.send(doc.data());
              return res.status(200).send();
            } else {
              return res
                .status(404)
                .send({ message: "No user settings found. Please contact the administrator" });
            }
          });
      });
    });
};
