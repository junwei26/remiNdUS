const admin = require("firebase-admin");
const db = admin.firestore();

exports.create = (req, res) => {
  if (!req.body.uid) {
    return res.status(400).send({ message: "You must be logged in to make this operation!" });
  }
  if (!req.body.name) {
    return res.status(400).send({ message: "Activity must have a name!" });
  }
  if (!req.body.date) {
    return res.status(400).send({ message: "Activity must have a date!" });
  }
  if (!req.body.starttime) {
    return res.status(400).send({ message: "Activity must have a start time!" });
  }
  if (!req.body.endtime) {
    return res.status(400).send({ message: "Activity must have an end time!" });
  }
  if (req.body.endtime < req.body.starttime) {
    return res
      .status(400)
      .send({ message: "Activity start time must be before activity end time!" });
  }

  const activity = {
    name: req.body.name,
    description: req.body.description,
    date: req.body.date,
    starttime: req.body.starttime,
    endtime: req.body.endtime,
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
          .collection("activities")
          .doc()
          .set(activity)
          .then(() => {
            return res.status(200).send({ message: "Activity created successfully!" });
          })
      )
    );
};

exports.getAll = (req, res) => {
  var activities = [];

  db.collection("users")
    .where("uid", "==", req.query.uid)
    .limit(1)
    .get()
    .then((data) => {
      if (data.empty) {
        return res.status(404).send({ message: "No activities found." });
      }
      data.forEach((doc) => {
        db.collection("users")
          .doc(doc.id)
          .collection("activities")
          .where("date", "==", req.query.date)
          .get()
          .then((querySnapshot) => {
            querySnapshot.forEach((reminder) => {
              activities.push(reminder.data());
            });
            res.send(activities);
            return res.status(200).send();
          });
      });
    });
};
