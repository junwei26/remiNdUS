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
    Username: req.body.username,
    Verified: false,
    telegramHandle: req.body.telegramHandle,
    telegramSendReminders: false,
    telegramReminderTiming: "0800",
  };
  db.collection("users")
    .add(settings)
    .then(() => {
      return res.status(200).send({ message: "User settings successfully created" });
    });
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
