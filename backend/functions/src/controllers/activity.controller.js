const admin = require("firebase-admin");
const db = admin.firestore();

// reminderCollection should be "plannedReminders" or "recurringReminders"
const getActivity = (userDoc, activityId, activityCollection) => {
  return userDoc
    .collection(activityCollection)
    .doc(activityId)
    .get()
    .then((documentSnapshot) => {
      return userDoc
        .collection("templateActivity")
        .doc(documentSnapshot.get("templateActivityId"))
        .get()
        .then((templateDocumentSnapshot) => {
          const reminderType = activityCollection === "plannedActivities" ? "planned" : "recurring";
          return {
            ...documentSnapshot.data(),
            ...templateDocumentSnapshot.data(),
            reminderType,
            activityId,
          };
        })
        .catch((error) => {
          throw `Unable to retrieve template activity. ${error}`;
        });
    })
    .catch((error) => {
      throw `Unable to retrieve ${activityCollection}. ${error}`;
    });
};

// Helper for getSubscribedPackages and get query
const getActivitiesById = (uid, activityIds, activityCollection) => {
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
      let activities = [];

      querySnapshot.forEach((queryDocumentSnapshot) => {
        for (let i = 0; i < activityIds.length; ++i) {
          promises.push(getActivity(queryDocumentSnapshot.ref, activityIds[i], activityCollection));
        }
      });
      return Promise.all(promises).then((values) => {
        activities = [].concat.apply([], values);
        return activities;
      });
    })
    .catch((error) => {
      throw error;
    });
};

const getAllActivities = (userQuerySnapshot) => {
  let promises = [];

  userQuerySnapshot.forEach((queryDocumentSnapshot) => {
    const userDoc = queryDocumentSnapshot.ref;
    promises.push(
      userDoc
        .collection("plannedActivities")
        .get()
        .then((querySnapshot) => {
          return getActivitiesById(
            userDoc,
            querySnapshot.docs.map((queryDocumentSnapshot) => queryDocumentSnapshot.id),
            "plannedActivities"
          );
        })
    );
    promises.push(
      userDoc
        .collection("recurringActivities")
        .get()
        .then((querySnapshot) => {
          return getActivitiesById(
            userDoc,
            querySnapshot.docs.map((queryDocumentSnapshot) => queryDocumentSnapshot.id),
            "recurringActivities"
          );
        })
    );
  });

  return Promise.all(promises);
};

exports.getAll = (req, res) => {
  db.collection("users")
    .where("uid", "==", req.query.uid)
    .limit(1)
    .get()
    .then((querySnapshot) => {
      if (querySnapshot.empty) {
        throw new Error("No user found. Please contact the administrator");
      }

      let activities = [];

      getAllActivities(querySnapshot)
        .then((results) => {
          activities = [].concat.apply([], results);
          res.send(activities);
          return res.status(200).send({ message: "Successfully retrieved all activities" });
        })
        .catch((error) => {
          return res.status(404).send({ message: `Error retrieving all activities. ${error}` });
        });
    })
    .catch((error) => {
      return res
        .status(404)
        .send({ message: `Error getting user database when getting all activities. ${error}` });
    });
};

exports.get = (req, res) => {
  if (!req.query.uid) {
    return res.status(400).send({ message: "You must be logged in to make this operation!" });
  }
  if (!req.query.activityIds || req.query.activityIds.length === 0) {
    return res.status(400).send({ message: "Activities must have activity IDs!" });
  }
  if (!req.query.activityCollection) {
    return res.status(400).send({ message: "Activities must be recurring or planned" });
  }

  return getActivitiesById(req.query.uid, req.query.activityIds, req.query.activityCollection)
    .then((activities) => {
      res.send(activities);
      return res.status(200).send();
    })
    .catch((error) => {
      return res.status(404).send({ message: `Error getting reminders. ${error}` });
    });

  // db.collection("users")
  //   .where("uid", "==", req.query.uid)
  //   .limit(1)
  //   .get()
  //   .then((data) => {
  //     if (data.empty) {
  //       return res.status(404).send({ message: "No activities found." });
  //     }
  //     data.forEach((doc) => {
  //       db.collection("users")
  //         .doc(doc.id)
  //         .collection("activities")
  //         .doc(req.query.activityId)
  //         .get()
  //         .then((doc) => {
  //           res.send({ ...doc.data(), activityId: doc.id });
  //           return res.status(200).send({ message: "Successfully retrieved activity!" });
  //         })
  //         .catch((error) => {
  //           return res.status(404).send({ message: `Error getting activity. ${error}` });
  //         });
  //     });
  //   })
  //   .catch((error) => {
  //     return res
  //       .status(400)
  //       .send({ message: `Error getting user database when getting activity. ${error}` });
  //   });
};

exports.getTemplateActivities = (req, res) => {
  if (!req.query.uid) {
    return res.status(400).send({ message: "You must be logged in to make this operation!" });
  }

  db.collection("users")
    .where("uid", "==", req.query.uid)
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

exports.getByTelegram = (req, res) => {
  if (!req.query.telegramHandle) {
    return res.status(400).send({ message: "You must be logged in to make this operation!" });
  }

  db.collection("users")
    .where("telegramHandle", "==", req.query.telegramHandle)
    .limit(1)
    .get()
    .then((querySnapshot) => {
      if (querySnapshot.empty) {
        return res.status(404).send({ message: "No activities found." });
      }

      let activities = [];

      getAllActivities(querySnapshot)
        .then((results) => {
          activities = [].concat.apply([], results);
          res.send(activities);
          return res.status(200).send({ message: "Successfully retrieved all activities" });
        })
        .catch((error) => {
          return res.status(404).send({ message: `Error retrieving all activities. ${error}` });
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

  let activities = [];
  let userDoc = db.collection("users").doc(req.query.uid);

  userDoc
    .collection("plannedActivities")
    .where("startDateTime", ">=", req.query.currentDateTime)
    .where("startDateTime", "<=", req.query.endDateTime)
    .get()
    .then((querySnapshot) => {
      activities = getActivitiesById(
        userDoc,
        querySnapshot.docs.map((queryDocumentSnapshot) => queryDocumentSnapshot.id),
        "plannedActivities"
      );
      res.send(activities);
      return res.status(200).send({ message: "Successfully retrieved planned activities" });
    })
    .catch((error) => {
      return res.status(404).send({
        message: `Issue retrieving planned activities from certain range of time. ${error}`,
      });
    });

  // userDoc.collection("recurringActivities").where("")

  // generate recurring activities
};

// access the new document by using createTemplate(...).then((templateReminderDoc) => {...})
// const createTemplate = (uid, name, description, defaultLength) => {
//   return db
//     .collection("users")
//     .doc(uid)
//     .collection("templateActivities")
//     .add({ name, description, defaultLength, eventType: "1" });
// };

// // access the new document by using createPlannedReminder(...).then((plannedReminderDoc) => {...})
// const createPlannedActivity = (uid, templateActivityId, startDateTime, endDateTime, active) => {
//   return db
//     .collection("users")
//     .doc(uid)
//     .collection("plannedActivities")
//     .add({ templateActivityId, startDateTime, endDateTime, active });
// };

// // If frequency is weekly, take date as 1-7 (Mon, Tue, ..., Sun). If frequency is monthly, take date as 1-31
// const createRecurringActivity = (
//   uid,
//   templateActivityId,
//   frequency,
//   startTime,
//   endTime,
//   date,
//   active
// ) => {
//   return db
//     .collection("users")
//     .doc(uid)
//     .collection("recurringActivities")
//     .add({ templateActivityId, frequency, startTime, endTime, date, active });
// };

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
