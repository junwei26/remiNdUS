const admin = require("firebase-admin");
const db = admin.firestore();

exports.getTemplateActivities = (req, res) => {
  if (!req.body.uid) {
    return res.status(400).send({ message: "You must be logged in to make this operation!" });
  }

  db.collection("users")
    .where("uid", "==", req.body.uid)
    .limit(1)
    .get()
    .then((querySnapshot) => {
      if (querySnapshot.empty) {
        throw "No user found. Please contact the administrator";
      }

      querySnapshot.forEach((queryDocumentSnapshot) => {
        queryDocumentSnapshot.ref
          .collection("templateActivities")
          .get()
          .then((querySnapshot) => {
            res.send(querySnapshot.docs);
            return res.status(200).send({ message: "Template activities retrieved successfully" });
          });
      });
    })
    .catch((error) => {
      return res
        .status(400)
        .send({ message: `Issue getting template activities from user. ${error}` });
    });
};

exports.create = (req, res) => {
  if (!req.body.uid) {
    return res.status(400).send({ message: "You must be logged in to make this operation!" });
  }
  if (!req.body.name) {
    return res.status(400).send({ message: "Activity must have a name!" });
  }
  if (!req.body.description) {
    return res.status(400).send({ message: "Activity must have a description!" });
  }
  if (!req.body.startDateTime) {
    return res.status(400).send({ message: "Activity must have a start time!" });
  }
  if (!req.body.endDateTime) {
    return res.status(400).send({ message: "Activity must have an end time!" });
  }
  if (req.body.endDateTime <= req.body.startDateTime) {
    return res
      .status(400)
      .send({ message: "Activity start time must be before activity end time!" });
  }

  const activity = {
    name: req.body.name,
    description: req.body.description,
    startDateTime: req.body.startDateTime,
    endDateTime: req.body.endDateTime,
    eventType: "1",
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
          .catch((error) => {
            return res.status(400).send({ message: `Error creating activity. ${error}` });
          })
      )
    )
    .catch((error) => {
      return res
        .status(400)
        .send({ message: `Error getting user database when creating activity. ${error}` });
    });
};

exports.update = (req, res) => {
  if (!req.body.uid) {
    return res.status(400).send({ message: "You must be logged in to make this operation!" });
  }
  if (!req.body.activityId) {
    return res.status(400).send({ message: "Missing Activity ID!" });
  }
  if (!req.body.name) {
    return res.status(400).send({ message: "Activity must have a name!" });
  }
  if (!req.body.description) {
    return res.status(400).send({ message: "Activity must have a description!" });
  }
  if (!req.body.startDateTime) {
    return res.status(400).send({ message: "Activity must have a start time!" });
  }
  if (!req.body.endDateTime) {
    return res.status(400).send({ message: "Activity must have an end time!" });
  }
  if (req.body.endDateTime < req.body.startDateTime) {
    return res
      .status(400)
      .send({ message: "Activity start time must be before activity end time!" });
  }

  const updatedActivity = {
    name: req.body.name,
    description: req.body.description,
    startDateTime: req.body.startDateTime,
    endDateTime: req.body.endDateTime,
    eventType: "1",
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
          .doc(req.body.activityId)
          .update(updatedActivity)
          .then(() => {
            return res.status(200).send({ message: "Successfully updated activity!" });
          })
          .catch((error) => {
            return res.status(404).send({ message: `Error updating activity. ${error}` });
          })
      )
    )
    .catch((error) => {
      return res
        .status(400)
        .send({ message: `Error getting user database when updating activity. ${error}` });
    });
};

exports.get = (req, res) => {
  if (!req.query.uid) {
    return res.status(400).send({ message: "You must be logged in to make this operation!" });
  }
  if (!req.query.activityId) {
    return res.status(400).send({ message: "Activity must have a activity ID!" });
  }

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
          .doc(req.query.activityId)
          .get()
          .then((doc) => {
            res.send({ ...doc.data(), activityId: doc.id });
            return res.status(200).send({ message: "Successfully retrieved activity!" });
          })
          .catch((error) => {
            return res.status(404).send({ message: `Error getting activity. ${error}` });
          });
      });
    })
    .catch((error) => {
      return res
        .status(400)
        .send({ message: `Error getting user database when getting activity. ${error}` });
    });
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
          .get()
          .then((querySnapshot) => {
            querySnapshot.forEach((activity) => {
              activities.push({ activityId: activity.id, ...activity.data() });
            });
            res.send(activities);
            return res.status(200).send();
          });
      });
    })
    .catch((error) => {
      return res
        .status(400)
        .send({ message: `Error getting user database when getting all activities. ${error}` });
    });
};

exports.delete = (req, res) => {
  if (!req.query.uid) {
    return res.status(400).send({ message: "You must be logged in to make this operation!" });
  }
  if (!req.query.activityId) {
    return res.status(400).send({ message: "You must be logged in to make this operation!" });
  }
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
          .doc(req.query.activityId)
          .delete()
          .then(() => {
            return res.status(200).send({ message: "Activity successfully deleted" });
          });
      });
    })
    .catch((error) => {
      return res.status(400).send({ message: `Error deleting activity ${error}` });
    });
};

exports.range = (req, res) => {
  if (!req.query.uid) {
    return res.status(400).send({ message: "You must be logged in to make this operation!" });
  }
  if (!req.query.currentDateTime) {
    return res.status(400).send({ message: "You must have a valid date time!" });
  }
  const activities = [];

  db.collection("users")
    .doc(req.query.uid)
    .collection("activities")
    .where("startDateTime", ">=", req.query.currentDateTime)
    .where("startDateTime", "<=", req.query.endDateTime)
    .get()
    .then((querySnapshot) => {
      querySnapshot.forEach((activity) => {
        activities.push({ activityId: activity.id, ...activity.data() });
      });
      res.send(activities);
      return res.status(200).send();
    });
};

exports.getByTelegram = (req, res) => {
  if (!req.query.telegramHandle) {
    return res.status(400).send({ message: "You must be logged in to make this operation!" });
  }

  var activities = [];
  db.collection("users")
    .where("telegramHandle", "==", req.query.telegramHandle)
    .limit(1)
    .get()
    .then((data) => {
      if (data.empty) {
        return res.status(404).send({ message: "No activities found." });
      }
      data.forEach((doc) => {
        doc.ref
          .collection("activities")
          .get()
          .then((querySnapshot) => {
            querySnapshot.forEach((activity) => {
              activities.push({ activityId: activity.id, ...activity.data() });
            });
            res.send(activities);
            return res.status(200).send();
          });
      });
    })
    .catch((error) => {
      return res.status(400).send({ message: `Error deleting activity ${error}` });
    });
};
