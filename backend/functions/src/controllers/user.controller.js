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
    telegramChatId: "",
    telegramSendReminders: false,
    telegramReminderTiming: "0800",
    tags: [],
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
            return res.status(404).send({ message: `Error creating user database. ${error}` });
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
const updateSetting = (uid, res, updatedSetting, settingNameText) => {
  db.collection("users")
    .where("uid", "==", uid)
    .limit(1)
    .get()
    .then((data) => {
      if (data.empty) {
        return res.status(404).send({ message: "No user found. Please contact the administrator" });
      }
      data.forEach((doc) => {
        db.collection("users")
          .doc(doc.id)
          .update(updatedSetting)
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

exports.updateTest = (req, res) => {
  if (!req.body.telegramHandle) {
    return res
      .status(400)
      .send({ message: "You must use have a telegram handle to make this request!" });
  }
  if (!req.body.test) {
    return res.status(400).send({ message: "Error! Missing data." });
  }

  let uid = null;

  const queryDB = () => {
    db.collection("users")
      .where("telegramHandle", "==", req.body.telegramHandle)
      .limit(1)
      .get()
      .then((data) => {
        if (data.empty) {
          return res
            .status(404)
            .send({ message: "Cannot find user with associated telegram handle" });
        }
        data.forEach((doc) => {
          uid = doc.get("uid");
          const updatedSetting = {
            test: req.body.test,
          };
          return updateSetting(uid, res, updatedSetting, "test");
        });
      })
      .catch((error) => {
        return res.status(404).send({ message: `Error updating test. ${error}` });
      });
  };

  return queryDB();
};

exports.updateUsername = (req, res) => {
  if (!req.body.uid) {
    return res.status(400).send({ message: "You must be logged in to make this operation!" });
  }
  if (!req.body.username) {
    return res.status(400).send({ message: "Error! Missing data." });
  }

  const updatedSetting = {
    username: req.body.username,
  };

  return updateSetting(req.body.uid, res, updatedSetting, "username");
};

exports.updateTelegramHandle = (req, res) => {
  if (!req.body.uid) {
    return res.status(400).send({ message: "You must be logged in to make this operation!" });
  }
  if (!req.body.telegramHandle) {
    return res.status(400).send({ message: "Error! Missing data." });
  }

  const updatedSetting = {
    telegramHandle: req.body.telegramHandle,
  };

  return updateSetting(req.body.uid, res, updatedSetting, "telegram handle");
};

exports.updateTelegramSendReminders = (req, res) => {
  if (!req.body.uid) {
    return res.status(400).send({ message: "You must be logged in to make this operation!" });
  }
  if (!(req.body.telegramSendReminders || req.body.telegramSendReminders === false)) {
    return res.status(400).send({ message: "Error! Missing data." });
  }

  const updatedSetting = {
    telegramSendReminders: req.body.telegramSendReminders,
  };

  return updateSetting(req.body.uid, res, updatedSetting, "send telegram reminders");
};

exports.updateTelegramReminderTiming = (req, res) => {
  if (!req.body.uid) {
    return res.status(400).send({ message: "You must be logged in to make this operation!" });
  }
  if (!req.body.telegramReminderTiming) {
    return res.status(400).send({ message: "Error! Missing data." });
  }

  const updatedSetting = {
    telegramReminderTiming: req.body.telegramReminderTiming,
  };

  return updateSetting(req.body.uid, res, updatedSetting, "telegram reminder timing");
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

exports.getTelegramReminderUsers = (req, res) => {
  let telegramHandles = [];

  db.collection("users")
    .where("telegramSendReminders", "==", true)
    .get()
    .then((data) => {
      if (data.empty) {
        res.send({});
        return res.status(400).send({ message: "Is empty" });
      } else {
        data.forEach((doc) => {
          telegramHandles.push(doc.get("telegramChatId"));
        });
      }
      res.send(telegramHandles);
      return res.status(200).send();
    });
};

exports.addTag = (req, res) => {
  if (Array.isArray(req.body.activityTag)) {
    db.collection("users")
      .doc(req.body.uid)
      .update({
        tags: admin.firestore.FieldValue.arrayUnion(...req.body.activityTag),
      })
      .then(() => res.status(200).send({ message: "Tag added successfully" }))
      .catch((error) => {
        return res.status(404).send({ message: `Adding of tag unsuccessful. ${error}` });
      });
  } else {
    db.collection("users")
      .doc(req.body.uid)
      .update({
        tags: admin.firestore.FieldValue.arrayUnion(req.body.activityTag),
      })
      .then(() => res.status(200).send({ message: "Tag added successfully" }))
      .catch((error) => {
        return res.status(404).send({ message: `Adding of tag unsuccessful. ${error}` });
      });
  }
};

exports.setChatId = (req, res) => {
  db.collection("users")
    .where("telegramHandle", "==", req.body.telegramHandle)
    .limit(1)
    .get()
    .then((querySnapshot) => {
      querySnapshot.forEach((doc) => {
        db.collection("users").doc(doc.id).update({ telegramChatId: req.body.chatId });
      });
      return res.status(200).send({ message: "Chat Id successfully recorded" });
    })
    .catch(() => res.status(400).send({ message: "Chat Id not recorded" }));
};
