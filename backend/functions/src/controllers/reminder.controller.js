const admin = require("firebase-admin");
const db = admin.firestore();

// Helper for getSubscribedPackages
const getRemindersByIds = (req, res, uid, reminderIds, terminal = true) => {
  return db
    .collection("users")
    .where("uid", "==", uid)
    .limit(1)
    .get()
    .then((querySnapshot) => {
      if (querySnapshot.empty) {
        if (terminal) {
          return res
            .status(404)
            .send({ message: "No user found. Please contact the administrator" });
        } else {
          throw new Error("No user found. Please contact the administrator");
        }
      }

      let promises = [];
      let reminders = [];

      querySnapshot.forEach((queryDocumentSnapshot) => {
        for (let i = 0; i < reminderIds.length; ++i) {
          promises.push(
            queryDocumentSnapshot.ref
              .collection("reminders")
              .doc(reminderIds[i])
              .get()
              .then((doc) => {
                return { ...doc.data(), reminderId: doc.id };
              })
          );
        }
      });
      return Promise.all(promises).then((values) => {
        reminders = [].concat.apply([], values);

        if (terminal) {
          res.send(reminders);
          return res.status(200).send({ message: "Successfully retrieved reminder!" });
        } else {
          return reminders;
        }
      });
    })
    .catch((error) => {
      if (terminal) {
        return res.status(404).send({ message: `Error getting reminders from owner. ${error}` });
      } else {
        throw error;
      }
    });
};

// Helper for getSubscribedPackages
const getPackageReminderIds = (uid, reminderPackageId) => {
  return db
    .collection("users")
    .where("uid", "==", uid)
    .limit(1)
    .get()
    .then((querySnapshot) => {
      if (querySnapshot.empty) {
        throw "No user found. Please contact the administrator";
      }
      let reminderIds = [];
      let promises = [];

      querySnapshot.forEach((queryDocumentSnapshot) => {
        promises.push(
          queryDocumentSnapshot.ref
            .collection("reminderPackages")
            .doc(reminderPackageId)
            .get()
            .then((documentSnapshot) => {
              return documentSnapshot.get("reminderIds");
            })
        );
      });

      return Promise.all(promises).then((values) => {
        reminderIds = [].concat.apply([], values);
        return reminderIds;
      });
    });
};

exports.getAll = (req, res) => {
  let reminders = [];

  db.collection("users")
    .where("uid", "==", req.query.uid)
    .limit(1)
    .get()
    .then((querySnapshot) => {
      if (querySnapshot.empty) {
        return res.status(404).send({ message: "No user found. Please contact the administrator" });
      }
      querySnapshot.forEach((queryDocumentSnapshot) => {
        queryDocumentSnapshot.ref
          .collection("reminders")
          .get()
          .then((querySnapshot) => {
            querySnapshot.forEach((reminder) => {
              reminders.push({ ...reminder.data(), reminderId: reminder.id });
            });
            res.send(reminders);
            return res.status(200).send();
          });
      });
    });
};

exports.get = (req, res) => {
  if (!req.query.uid) {
    return res.status(400).send({ message: "You must be logged in to make this operation!" });
  }
  if (!req.query.reminderIds || req.query.reminderIds.length === 0) {
    return res.status(400).send({ message: "Reminders must have reminder IDs!" });
  }

  return getRemindersByIds(req, res, req.query.uid, req.query.reminderIds);
};

exports.getSubscribed = (req, res) => {
  if (!req.query.uid) {
    return res.status(400).send({ message: "You must be logged in to make this operation!" });
  }
  db.collection("users")
    .where("uid", "==", req.query.uid)
    .limit(1)
    .get()
    .then((querySnapshot) => {
      if (querySnapshot.empty) {
        return res.status(404).send({ message: "No user found. Please contact the administrator" });
      }

      let subscribedPackages = [];

      querySnapshot.forEach((queryDocumentSnapshot) => {
        queryDocumentSnapshot.ref
          .collection("subscribedPackages")
          .get()
          .then((querySnapshot) => {
            subscribedPackages = querySnapshot.docs;

            let allSubscribedReminders = [];
            let promises = [];

            for (let i = 0; i < subscribedPackages.length; ++i) {
              const subscribedPackage = subscribedPackages[i].data();
              promises.push(
                getPackageReminderIds(
                  subscribedPackage.userUid,
                  subscribedPackage.reminderPackageId
                ).then((reminderIds) => {
                  return getRemindersByIds(
                    req,
                    res,
                    subscribedPackage.userUid,
                    reminderIds,
                    false
                  ).then((subscribedReminders) => {
                    return subscribedReminders;
                  });
                })
              );
            }

            Promise.all(promises).then((values) => {
              allSubscribedReminders = [].concat.apply([], values);

              res.send(allSubscribedReminders);
              return res.status(200).send({
                message: "Successfully retrieved all reminders from subscribed reminder packages.",
              });
            });
          });
      });
    })
    .catch((error) => {
      return res
        .status(404)
        .send({ message: `Error retrieving all subscribed reminders. ${error}` });
    });
};

exports.range = (req, res) => {
  if (!req.query.uid) {
    return res.status(400).send({ message: "You must be logged in to make this operation!" });
  }
  if (!req.query.currentDateTime) {
    return res.status(400).send({ message: "You must have a valid date time!" });
  }
  const reminders = [];

  db.collection("users")
    .doc(req.query.uid)
    .collection("reminders")
    .where("dateTime", ">=", req.query.currentDateTime)
    .where("dateTime", "<=", req.query.endDateTime)
    .get()
    .then((querySnapshot) => {
      querySnapshot.forEach((reminder) => {
        reminders.push({ reminderId: reminder.id, ...reminder.data() });
      });
      res.send(reminders);
      return res.status(200).send();
    });
};

exports.create = (req, res) => {
  if (!req.body.uid) {
    return res.status(400).send({ message: "You must be logged in to make this operation!" });
  }
  if (!req.body.name) {
    return res.status(400).send({ message: "Reminders must have a name!" });
  }
  if (!req.body.description) {
    return res.status(400).send({ message: "Reminders must have a description!" });
  }
  if (!req.body.dateTime) {
    return res.status(400).send({ message: "Reminders must have a date!" });
  }

  const reminder = {
    name: req.body.name,
    description: req.body.description,
    dateTime: req.body.dateTime,
    eventType: "2",
  };
  db.collection("users")
    .where("uid", "==", req.body.uid)
    .limit(1)
    .get()
    .then((querySnapshot) =>
      querySnapshot.forEach((doc) =>
        db
          .collection("users")
          .doc(doc.id)
          .collection("reminders")
          .doc()
          .set(reminder)
          .then(() => {
            return res.status(200).send({ message: "Reminder created successfully!" });
          })
      )
    );
};

exports.update = (req, res) => {
  if (!req.body.uid) {
    return res.status(400).send({ message: "You must be logged in to make this operation!" });
  }
  if (!req.body.reminderId) {
    return res.status(400).send({ message: "Missing Reminder ID!" });
  }
  if (!req.body.name) {
    return res.status(400).send({ message: "Reminders must have a name!" });
  }
  if (!req.body.description) {
    return res.status(400).send({ message: "Reminders must have a description!" });
  }
  if (!req.body.dateTime) {
    return res.status(400).send({ message: "Reminders must have a date!" });
  }

  const updatedReminder = {
    name: req.body.name,
    description: req.body.description,
    dateTime: req.body.dateTime,
    eventType: "2",
  };

  db.collection("users")
    .where("uid", "==", req.body.uid)
    .limit(1)
    .get()
    .then((querySnapshot) =>
      querySnapshot.forEach((queryDocumentSnapshot) =>
        queryDocumentSnapshot.ref
          .collection("reminders")
          .doc(req.body.reminderId)
          .update(updatedReminder)
          .then(() => {
            return res.status(200).send({ message: "Successfully updated reminder!" });
          })
          .catch((error) => {
            return res.status(404).send({ message: `Error updating reminder. ${error}` });
          })
      )
    );
};

exports.delete = (req, res) => {
  if (!req.query.uid) {
    return res.status(400).send({ message: "You must be logged in to make this operation!" });
  }
  if (!req.query.reminderId) {
    return res.status(400).send({ message: "Reminder must have a reminder ID!" });
  }

  db.collection("users")
    .where("uid", "==", req.query.uid)
    .limit(1)
    .get()
    .then((querySnapshot) => {
      if (querySnapshot.empty) {
        return res.status(404).send({ message: "No user found. Please contact the administrator" });
      }
      querySnapshot.forEach((queryDocumentSnapshot) => {
        queryDocumentSnapshot.ref
          .collection("reminders")
          .doc(req.query.reminderId)
          .delete()
          .then(() => {
            return res.status(200).send({ message: "Successfully deleted reminder!" });
          })
          .catch((error) => {
            return res.status(404).send({ message: `Error deleting reminder. ${error}` });
          });
      });
    });
};

exports.getByTelegram = (req, res) => {
  if (!req.query.telegramHandle) {
    return res.status(400).send({ message: "You must be logged in to make this operation!" });
  }

  var reminders = [];
  db.collection("users")
    .where("telegramHandle", "==", req.query.telegramHandle)
    .limit(1)
    .get()
    .then((data) => {
      if (data.empty) {
        return res.status(404).send({ message: "No reminders found." });
      }
      data.forEach((doc) => {
        doc.ref
          .collection("reminders")
          .where("dateTime", ">=", req.query.currentDateTime)
          .where("dateTime", "<=", req.query.endDateTime)
          .get()
          .then((querySnapshot) => {
            querySnapshot.forEach((reminder) => {
              reminders.push({ reminderId: reminder.id, ...reminder.data() });
            });
            res.send(reminders);
            return res.status(200).send();
          });
      });
    })
    .catch((error) => {
      return res.status(400).send({ message: `Error retrieving reminders. ${error}` });
    });
};

exports.createByTelegram = (req, res) => {
  if (!req.body.name) {
    return res.status(400).send({ message: "Reminders must have a name!" });
  }
  if (!req.body.description) {
    return res.status(400).send({ message: "Reminders must have a description!" });
  }
  if (!req.body.dateTime) {
    return res.status(400).send({ message: "Reminders must have a date!" });
  }

  const reminder = {
    name: req.body.name,
    description: req.body.description,
    dateTime: req.body.dateTime,
    eventType: "2",
  };
  db.collection("users")
    .where("telegramHandle", "==", req.body.telegramHandle)
    .limit(1)
    .get()
    .then((querySnapshot) =>
      querySnapshot.forEach((doc) =>
        db
          .collection("users")
          .doc(doc.id)
          .collection("reminders")
          .doc()
          .set(reminder)
          .then(() => {
            return res.status(200).send({ message: "Reminder created successfully!" });
          })
      )
    );
};
