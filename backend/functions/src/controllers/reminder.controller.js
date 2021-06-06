const db = require("firebase-admin").firestore();

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
        console.log(req.query.date);
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
