const admin = require("firebase-admin");
const db = admin.firestore();

exports.create = (req, res) => {
  if (!req.body.uid) {
    return res.status(400).send({ message: "You must be logged in to make this operation!" });
  }
  if (!req.body.name) {
    return res.status(400).send({ message: "Reminders must have a name!" });
  }
  if (!req.body.date) {
    return res.status(400).send({ message: "Reminders must have a date!" });
  }
  if (!req.body.time) {
    return res.status(400).send({ message: "Reminders must have a time!" });
  }
  const reminder = {
    name: req.body.name,
    description: req.body.description,
    date: req.body.date,
    time: req.body.time,
  };
  db.collection("users")
    .where("uid", "==", req.body.uid)
    .limit(1)
    .get()
    .then((data) =>
      data.forEach((doc) =>
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

exports.getAll = (req, res) => {
  var reminders = [];

  db.collection("users")
    .where("uid", "==", req.query.uid)
    .limit(1)
    .get()
    .then((data) => {
      if (data.empty) {
        return res.status(404).send({ message: "No reminders found." });
      }
      data.forEach((doc) => {
        db.collection("users")
          .doc(doc.id)
          .collection("reminders")
          .where("date", "==", req.query.date)
          .get()
          .then((querySnapshot) => {
            querySnapshot.forEach((reminder) => {
              reminders.push(reminder.data());
            });
            res.send(reminders);
            return res.status(200).send();
          });
      });
    });
};
