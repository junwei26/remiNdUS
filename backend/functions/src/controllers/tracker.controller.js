const admin = require("firebase-admin");
const db = admin.firestore();

exports.create = (req, res) => {
  if (!req.body.uid) {
    return res.status(400).send({
      message: "Invalid user id, please login",
    });
  }

  const trackedActivity = {
    uid: req.body.uid,
    name: req.body.name,
    tag: req.body.tag,
    plannedStartDateTime: req.body.plannedStartDateTime,
    plannedEndDateTime: req.body.plannedEndDateTime,
    actualStartDateTime: req.body.actualStartDateTime,
    actualEndDateTime: req.body.actualEndDateTime,
  };

  db.collection("users")
    .doc(req.body.uid)
    .collection("trackedActivities")
    .doc()
    .set(trackedActivity)
    .then(() => {
      return res.status(200).send({ message: "Successfully tracked" });
    })
    .catch(() => {
      return res.status(400).send({ message: "Tracking failed, please try again." });
    });
};

exports.getAll = (req, res) => {
  if (!req.query.uid) {
    return res.status(400).send({
      message: "Invalid user id, please login",
    });
  }
  db.collection("users")
    .doc(req.query.uid)
    .collection("trackedActivities")
    .get()
    .then((querySnapshot) => {
      const trackedActivities = [];
      querySnapshot.forEach((trackedActivity) => {
        trackedActivities.push(trackedActivity.data());
      });
      res.send(trackedActivities);
      return res.status(200);
    })
    .catch(() => {
      return res
        .status(400)
        .send({ message: "Retrieval of track activities failed, please try again." });
    });
};
