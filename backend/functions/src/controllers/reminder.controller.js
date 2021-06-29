const admin = require("firebase-admin");
const db = admin.firestore();

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
      querySnapshot.forEach((doc) =>
        db
          .collection("users")
          .doc(doc.id)
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

exports.get = (req, res) => {
  if (!req.query.uid) {
    return res.status(400).send({ message: "You must be logged in to make this operation!" });
  }
  if (!req.query.reminderIds || req.query.reminderIds.length === 0) {
    return res.status(400).send({ message: "Reminders must have reminder IDs!" });
  }

  db.collection("users")
    .where("uid", "==", req.query.uid)
    .limit(1)
    .get()
    .then((querySnapshot) => {
      if (querySnapshot.empty) {
        return res.status(404).send({ message: "No reminders found." });
      }

      let promises = [];
      let reminders = [];

      querySnapshot.forEach((queryDocumentSnapshot) => {
        for (let i = 0; i < req.query.reminderIds.length; ++i) {
          promises.push(
            queryDocumentSnapshot.ref
              .collection("reminders")
              .doc(req.query.reminderIds[i])
              .get()
              .then((doc) => {
                reminders.push({ ...doc.data(), reminderIds: doc.id });
              })
              .catch((error) => {
                return res.status(404).send({ message: `Error getting reminder. ${error}` });
              })
          );
        }
      });
      Promise.all(promises)
        .then(() => {
          res.send(reminders);
          return res.status(200).send({ message: "Successfully retrieved reminder!" });
        })
        .catch((error) => {
          return res.status(404).send({ message: `Error getting reminders. ${error}` });
        });
    });
};

exports.getAll = (req, res) => {
  var reminders = [];

  db.collection("users")
    .where("uid", "==", req.query.uid)
    .limit(1)
    .get()
    .then((querySnapshot) => {
      if (querySnapshot.empty) {
        return res.status(404).send({ message: "No reminders found." });
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
        return res.status(404).send({ message: "No reminders found." });
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
