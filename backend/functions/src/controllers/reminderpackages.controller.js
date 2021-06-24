const admin = require("firebase-admin");
const db = admin.firestore();

exports.create = (req, res) => {
  if (!req.body.uid) {
    return res.status(400).send({ message: "You must be logged in to make this operation!" });
  }
  if (!req.body.name) {
    return res.status(400).send({ message: "Error! No name given for reminder package" });
  }
  if (!req.body.description) {
    return res.status(400).send({ message: "Error! No description given for reminder package" });
  }
  if (!req.body.reminderIds) {
    return res.status(400).send({ message: "Error! No reminders given for reminder package" });
  }

  const reminderPackage = {
    name: req.body.name,
    description: req.body.description,
    lastModified: new Date().getTime(),
    numberOfReminders: req.body.reminderIds.length,
    reminderIds: req.body.reminderIds,
  };

  db.collection("users")
    .where("uid", "==", req.body.uid)
    .limit(1)
    .get()
    .then((data) => {
      if (data.empty) {
        return res.status(404).send({ message: "No user found. Please contact the administrator" });
      }

      // Only one user, one doc
      data.forEach((doc) => {
        doc.ref.collection("reminderPackages").add(reminderPackage);
      });

      return res.status(200).send({ message: "Reminder package successfully created!" });
    })
    .catch((error) => {
      return res.status(400).send({
        message: `Error retrieving user details. ${error}`,
      });
    });
};

exports.get = (req, res) => {
  if (!req.query.uid) {
    return res.status(400).send({ message: "You must be logged in to make this operation!" });
  }

  db.collection("users")
    .where("uid", "==", req.query.uid)
    .limit(1)
    .get()
    .then((data) => {
      if (data.empty) {
        return res.status(404).send({ message: "No user found. Please contact the administrator" });
      }

      let packageList = [];

      // Actually only one doc (one user)
      data.forEach((doc) => {
        doc.ref
          .collection("reminderPackages")
          .get()
          .then((data) => {
            if (data.empty) {
              return res.status(200).send({ message: "No Reminder Packages found." });
            }

            data.forEach((doc) => {
              packageList.push(doc.data());
            });

            res.send(packageList);
            return res.status(200).send({
              message: "Reminder packages successfully retrieved!",
            });
          })
          .catch((error) => {
            return res.status(400).send({
              message: `Error retrieving reminder packages. ${error}`,
            });
          });
      });
    })
    .catch((error) => {
      return res.status(400).send({
        message: `Error retrieving user details. ${error}`,
      });
    });
};
