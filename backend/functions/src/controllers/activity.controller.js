const admin = require("firebase-admin");
const db = admin.firestore();

// activityCollection should be "plannedActivities" or "recurringActivities"
const getActivity = (userDoc, activityId, activityCollection) => {
  return userDoc
    .collection(activityCollection)
    .doc(activityId)
    .get()
    .then((documentSnapshot) => {
      return userDoc
        .collection("templateActivities")
        .doc(documentSnapshot.get("templateActivityId"))
        .get()
        .then((templateDocumentSnapshot) => {
          const activityType = activityCollection === "plannedActivities" ? "planned" : "recurring";
          return {
            ...documentSnapshot.data(),
            ...templateDocumentSnapshot.data(),
            activityType,
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
const getActivitiesById = (userDoc, activityIds, activityCollection) => {
  let promises = [];
  let activities = [];

  for (let i = 0; i < activityIds.length; ++i) {
    promises.push(getActivity(userDoc, activityIds[i], activityCollection));
  }

  return Promise.all(promises).then((values) => {
    activities = [].concat.apply([], values);
    return activities;
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

  db.collection("users")
    .where("uid", "==", req.query.uid)
    .limit(1)
    .get()
    .then((querySnapshot) => {
      if (querySnapshot.empty) {
        throw "No user found. Please contact the administrator";
      }

      querySnapshot.forEach((queryDocumentSnapshot) => {
        return getActivitiesById(
          queryDocumentSnapshot.ref,
          req.query.activityIds,
          req.query.activityCollection
        )
          .then((activities) => {
            res.send(activities);
            return res.status(200).send();
          })
          .catch((error) => {
            return res.status(404).send({ message: `Error getting activity. ${error}` });
          });
      });
    });
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
            res.send(
              querySnapshot.docs.map((doc) => {
                return { ...doc.data(), templateActivityId: doc.id };
              })
            );
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
const createTemplate = (uid, name, description, defaultLength) => {
  return db
    .collection("users")
    .doc(uid)
    .collection("templateActivities")
    .add({ name, description, defaultLength, eventType: "1" });
};

// access the new document by using createPlannedReminder(...).then((plannedReminderDoc) => {...})
const createPlannedActivity = (uid, templateActivityId, startDateTime, endDateTime, active) => {
  return db
    .collection("users")
    .doc(uid)
    .collection("plannedActivities")
    .add({ templateActivityId, startDateTime, endDateTime, active });
};

// If frequency is weekly, take date as 1-7 (Mon, Tue, ..., Sun). If frequency is monthly, take date as 1-31
const createRecurringActivity = (
  uid,
  templateActivityId,
  frequency,
  startTime,
  endTime,
  date,
  active
) => {
  return db
    .collection("users")
    .doc(uid)
    .collection("recurringActivities")
    .add({ templateActivityId, frequency, startTime, endTime, date, active });
};

/*
uid: mandatory
active: mandatory
templateActivityId: required if not creating new templateActivity
name: required if creating new templateActivity
description: required if creating new templateActivity
defaultLength: required if creating new templateActivity
frequency: required if creating recurringActivity
startTime: required if creating recurringActivity
endTime: required if creating recurringActivity
date: required if creating recurringActivity
startDateTime: required if creating plannedActivity
endDateTime: required if creating plannedActivity
*/
exports.create = (req, res) => {
  if (!req.body.uid) {
    return res.status(400).send({ message: "You must be logged in to make this operation!" });
  }

  // If no templateActivityId provided, assume creating a brand new activity
  if (!req.body.templateActivityId) {
    if (!req.body.name) {
      return res.status(400).send({ message: "Activities must have a name!" });
    }
    if (!req.body.description) {
      return res.status(400).send({ message: "Activities must have a description!" });
    }
    if (!req.body.defaultLength) {
      return res.status(400).send({ message: "Activities must have a default length" });
    }

    // If there is no frequency specified, it is a planned activity, not recurring
    if (!req.body.frequency) {
      if (!req.body.startDateTime) {
        return res
          .status(400)
          .send({ message: "Planned Activity must have a start date and time" });
      }
      if (!req.body.endDateTime) {
        return res.status(400).send({ message: "Planned activity must have an end date and time" });
      }

      if (req.body.endDateTime < req.body.startDateTime) {
        return res
          .status(400)
          .send({ message: "Activity start time must be before activity end time!" });
      }
      createTemplate(req.body.uid, req.body.name, req.body.description, req.body.defaultLength)
        .then((templateActivityDoc) => {
          createPlannedActivity(
            req.body.uid,
            templateActivityDoc.id,
            req.body.startDateTime,
            req.body.endDateTime,
            req.body.active
          )
            .then(() => {
              return res.status(200).send({ message: "Planned activity created successfully!" });
            })
            .catch((error) => {
              return res.status(404).send({ message: `Error creating planned activity. ${error}` });
            });
        })
        .catch((error) => {
          return res.status(404).send({ message: `Error creating template activity. ${error}` });
        });
    } else {
      if (!req.body.startTime) {
        return res.status(400).send({ message: "Recurring activity must have a start time" });
      }
      if (!req.body.endTime) {
        return res.status(400).send({ message: "Recurring activity must have an end time" });
      }
      if (!req.body.date) {
        return res.status(400).send({ message: "Recurring activity must have a date" });
      }
      createTemplate(req.body.uid, req.body.name, req.body.description, req.body.defaultLength)
        .then((templateActivityDoc) => {
          createRecurringActivity(
            req.body.uid,
            templateActivityDoc.id,
            req.body.frequency,
            req.body.startTime,
            req.body.endTime,
            req.body.date,
            req.body.active
          )
            .then(() => {
              return res.status(200).send({ message: "Recurring activity created successfully!" });
            })
            .catch((error) => {
              return res
                .status(404)
                .send({ message: `Error creating recurring activity. ${error}` });
            });
        })
        .catch((error) => {
          return res.status(404).send({ message: `Error creating template activity. ${error}` });
        });
    }
  } else {
    // If there is no frequency specified, it is a planned activity, not recurring
    if (!req.body.frequency) {
      if (!req.body.startDateTime) {
        return res
          .status(400)
          .send({ message: "Planned Activity must have a start date and time" });
      }
      if (!req.body.endDateTime) {
        return res.status(400).send({ message: "Planned activity must have an end date and time" });
      }
      createPlannedActivity(
        req.body.uid,
        req.body.templateActivityId,
        req.body.startDateTime,
        req.body.endDateTime,
        req.body.active
      )
        .then(() => {
          return res.status(200).send({ message: "Planned activity created successfully!" });
        })
        .catch((error) => {
          return res.status(404).send({ message: `Error creating planned activity. ${error}` });
        });
    } else {
      if (!req.body.startTime) {
        return res.status(400).send({ message: "Recurring activity must have a start time" });
      }
      if (!req.body.endTime) {
        return res.status(400).send({ message: "Recurring activity must have an end time" });
      }
      if (!req.body.date) {
        return res.status(400).send({ message: "Recurring activity must have a date" });
      }
      createRecurringActivity(
        req.body.uid,
        req.body.templateActivityId,
        req.body.frequency,
        req.body.startTime,
        req.body.endTime,
        req.body.date,
        req.body.active
      )
        .then(() => {
          return res.status(200).send({ message: "Recurring activity created successfully!" });
        })
        .catch((error) => {
          return res.status(404).send({ message: `Error creating recurring activity. ${error}` });
        });
    }
  }
};

exports.update = (req, res) => {
  if (!req.body.uid) {
    return res.status(400).send({ message: "You must be logged in to make this operation!" });
  }
  if (!req.body.activityId) {
    return res.status(400).send({ message: "Missing Activity ID!" });
  }
  if (!req.body.templateActivityId) {
    return res.status(400).send({ message: "Missing Activity Template ID!" });
  }
  if (!req.body.name) {
    return res.status(400).send({ message: "Activities must have a name!" });
  }
  if (!req.body.description) {
    return res.status(400).send({ message: "Activities must have a description!" });
  }
  if (!req.body.defaultLength) {
    return res.status(400).send({ message: "Activities must have a default length" });
  }
  if (!req.body.frequency) {
    if (!req.body.startDateTime) {
      return res.status(400).send({ message: "Planned Activity must have a start date and time" });
    }
    if (!req.body.endDateTime) {
      return res.status(400).send({ message: "Planned activity must have an end date and time" });
    }
    if (req.body.endDateTime < req.body.startDateTime) {
      return res
        .status(400)
        .send({ message: "Activity start time must be before activity end time!" });
    }
  } else {
    if (!req.body.startTime) {
      return res.status(400).send({ message: "Recurring activity must have a start time" });
    }
    if (!req.body.endTime) {
      return res.status(400).send({ message: "Recurring activity must have an end time" });
    }
    if (!req.body.date) {
      return res.status(400).send({ message: "Recurring activity must have a date" });
    }
  }

  const updatedTemplateActivity = {
    name: req.body.name,
    description: req.body.name,
    defaultLength: req.body.defaultLength,
  };

  db.collection("users")
    .doc(req.body.uid)
    .collection("templateActivities")
    .doc(req.body.templateActivityId)
    .update(updatedTemplateActivity)
    .then(() => {
      if (!req.body.frequency) {
        const updatedPlannedActivity = {
          startDateTime: req.body.startDateTime,
          endDateTime: req.body.endDateTime,
          active: req.body.active,
        };

        db.collection("users")
          .doc(req.body.uid)
          .collection("plannedActivities")
          .doc(req.body.activityId)
          .update(updatedPlannedActivity)
          .then(() => {
            return res.status(200).send({ message: "Successfully updated planned activity!" });
          });
      } else {
        const updatedRecurringActivity = {
          startTime: req.body.startTime,
          endTime: req.body.endTime,
          date: req.body.date,
        };

        db.collection("users")
          .doc(req.body.uid)
          .collection("recurringActivities")
          .doc(req.body.activityId)
          .update(updatedRecurringActivity)
          .then(() => {
            return res.status(200).send({ message: "Successfully updated recurring activity!" });
          });
      }
    })
    .catch((error) => {
      return res.status(400).send({ message: `Error updating activity. ${error}` });
    });
};

exports.delete = (req, res) => {
  if (!req.query.uid) {
    return res.status(400).send({ message: "You must be logged in to make this operation!" });
  }
  if (!req.query.activityId) {
    return res.status(400).send({ message: "You must be logged in to make this operation!" });
  }
  if (!req.body.activityCollection) {
    return res.status(400).send({ message: "Missing activity collection!" });
  }

  db.collection("users")
    .where("uid", "==", req.query.uid)
    .limit(1)
    .get()
    .then((querySnapshot) => {
      if (querySnapshot.empty) {
        return res.status(404).send({ message: "User not found." });
      }

      querySnapshot.forEach((queryDocumentSnapshot) => {
        queryDocumentSnapshot.ref
          .collection(req.query.activityCollection)
          .doc(req.query.activityId)
          .delete()
          .then(() => {
            return res.status(200).send({ message: "Activity successfully deleted." });
          });
      });
    })
    .catch((error) => {
      return res.status(400).send({ message: `Error deleting activity. ${error}` });
    });
};
