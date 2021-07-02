const admin = require("firebase-admin");
const db = admin.firestore();

// Helper for getSubscribedPackages. Returns packageReminderIds for given user
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

// Helper for getSubscribedPackages and get query
const getRemindersByIds = (uid, reminderIds) => {
  return db
    .collection("users")
    .where("uid", "==", uid)
    .limit(1)
    .get()
    .then((querySnapshot) => {
      if (querySnapshot.empty) {
        throw new Error("No user found. Please contact the administrator");
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
        return reminders;
      });
    })
    .catch((error) => {
      throw error;
    });
};

const getSubscribed = (uid) => {
  return db
    .collection("users")
    .where("uid", "==", uid)
    .limit(1)
    .get()
    .then((querySnapshot) => {
      if (querySnapshot.empty) {
        throw new Error("No user found. Please contact the administrator");
      }

      let subscribedPackages = [];

      let promise = null;

      querySnapshot.forEach((queryDocumentSnapshot) => {
        // Note there is only one promise because there is only one user
        promise = queryDocumentSnapshot.ref
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
                  return getRemindersByIds(subscribedPackage.userUid, reminderIds).then(
                    (subscribedReminders) => {
                      return subscribedReminders.map((reminders) => {
                        return { ...reminders, subscribed: true };
                      });
                    }
                  );
                })
              );
            }
            return Promise.all(promises).then((values) => {
              allSubscribedReminders = [].concat.apply([], values);

              return allSubscribedReminders;
            });
          });
      });
      return promise;
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
              reminders.push({ ...reminder.data(), reminderId: reminder.id, subscribed: false });
            });

            getSubscribed(req.query.uid)
              .then((allSubscribedReminders) => {
                const allReminders = reminders.concat(allSubscribedReminders);

                res.send(allReminders);
                return res
                  .status(200)
                  .send({ message: "Successfully retrieved all local and subscribed reminders" });
              })
              .catch((error) => {
                return res
                  .status(404)
                  .send({ message: `Error retrieving subscribed reminders. ${error}` });
              });
          });
      });
    })
    .catch((error) => {
      return res.status(404).send({ message: `Error retrieving reminders. ${error}` });
    });
};

exports.get = (req, res) => {
  if (!req.query.uid) {
    return res.status(400).send({ message: "You must be logged in to make this operation!" });
  }
  if (!req.query.reminderIds || req.query.reminderIds.length === 0) {
    return res.status(400).send({ message: "Reminders must have reminder IDs!" });
  }

  return getRemindersByIds(req.query.uid, req.query.reminderIds)
    .then((reminders) => {
      res.send(reminders);
      return res.status(200).send();
    })
    .catch((error) => {
      return res.status(404).send({ message: `Error getting reminders. ${error}` });
    });
};

exports.getSubscribed = (req, res) => {
  if (!req.query.uid) {
    return res.status(400).send({ message: "You must be logged in to make this operation!" });
  }

  return getSubscribed(req.query.uid)
    .then((allSubscribedReminders) => {
      res.send(allSubscribedReminders);
      return res.status(200).send({
        message: "Successfully retrieved all reminders from subscribed reminder packages.",
      });
    })
    .catch((error) => {
      return res.status(404).send({ message: `Error retrieving subscribed reminders. ${error}` });
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
