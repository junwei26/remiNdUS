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

exports.getAllActivitiesExport = (userQuerySnapshot) => {
  return getAllActivities(userQuerySnapshot);
};

const getAllActivities = (
  userQuerySnapshot,
  plannedActivityQuery = (x) => x,
  recurringActivityQuery = (x) => x
) => {
  let promises = [];

  userQuerySnapshot.forEach((queryDocumentSnapshot) => {
    const userDoc = queryDocumentSnapshot.ref;
    promises.push(
      plannedActivityQuery(userDoc.collection("plannedActivities"))
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
      recurringActivityQuery(userDoc.collection("recurringActivities"))
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

      const plannedActivityQuery = (plannedActivitiesCollection) => {
        return plannedActivitiesCollection
          .where("startDateTime", ">=", req.query.currentDateTime)
          .where("startDateTime", "<=", req.query.endDateTime);
      };

      getAllActivities(querySnapshot, plannedActivityQuery)
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
const createTemplate = (uid, name, description, defaultLength, activityTag) => {
  return db
    .collection("users")
    .doc(uid)
    .collection("templateActivities")
    .add({ name, description, defaultLength, activityTag, eventType: "1" });
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
    if (!req.body.activtiyTag) {
      return res.status(400).send({ message: "Activities must have an activity tag" });
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
      createTemplate(
        req.body.uid,
        req.body.name,
        req.body.description,
        req.body.defaultLength,
        req.body.activityTag
      )
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
      createTemplate(
        req.body.uid,
        req.body.name,
        req.body.description,
        req.body.defaultLength,
        req.body.activityTag
      )
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
  if (!req.body.templateActivityId) {
    return res.status(400).send({ message: "Missing Activity Template ID!" });
  }
  if (!req.body.activityId) {
    return res.status(400).send({ message: "Missing Activity ID!" });
  }
  if (!req.body.activityCollection) {
    return res.status(400).send({ message: "Activity must have activity collection" });
  }

  let updatedActivity = null;

  if (req.body.activityCollection === "plannedActivities") {
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

    updatedActivity = {
      templateActivityId: req.body.templateActivityId,
      startDateTime: req.body.startDateTime,
      endDateTime: req.body.endDateTime,
      active: req.body.active,
    };
  } else if (req.body.activityCollection === "recurringActivities") {
    if (!req.body.startTime) {
      return res.status(400).send({ message: "Recurring activity must have a start time" });
    }
    if (!req.body.endTime) {
      return res.status(400).send({ message: "Recurring activity must have an end time" });
    }
    if (!req.body.date) {
      return res.status(400).send({ message: "Recurring activity must have a date" });
    }
    if (!req.body.frequency) {
      return res.status(400).send({ message: "Recurring activity must have a frequency" });
    }

    updatedActivity = {
      templateActivityId: req.body.templateActivityId,
      frequency: req.body.frequency,
      startTime: req.body.startTime,
      endTime: req.body.endTime,
      date: req.body.date,
      active: req.body.active,
    };
  }

  const promises = [];

  if (req.body.updateTemplate) {
    if (!req.body.name) {
      return res.status(400).send({ message: "Template activity must have a name!" });
    }
    if (!req.body.description) {
      return res.status(400).send({ message: "Template activity must have a description!" });
    }
    if (!req.body.activityTag) {
      return res.status(400).send({ message: "Template activity must have an activity tag" });
    }

    const updatedTemplateActivity = {
      name: req.body.name,
      description: req.body.description,
      activityTag: req.body.activityTag,
      eventType: "1",
    };

    promises.push(
      db
        .collection("users")
        .where("uid", "==", req.body.uid)
        .limit(1)
        .get()
        .then((querySnapshot) => {
          querySnapshot.forEach((queryDocumentSnapshot) => {
            queryDocumentSnapshot.ref
              .collection("templateActivities")
              .doc(req.body.templateActivityId)
              .update(updatedTemplateActivity);
          });
        })
    );
  }

  promises.push(
    db
      .collection("users")
      .where("uid", "==", req.body.uid)
      .limit(1)
      .get()
      .then((querySnapshot) =>
        querySnapshot.forEach((queryDocumentSnapshot) => {
          queryDocumentSnapshot.ref
            .collection(req.body.activityCollection)
            .doc(req.body.activityId)
            .update(updatedActivity);
        })
      )
  );

  Promise.all(promises)
    .then(() => {
      return res.status(200).send({ message: "Successfully updated reminder!" });
    })
    .catch((error) => {
      return res.status(404).send({ message: `Error updating reminder. ${error}` });
    });
};

exports.delete = (req, res) => {
  if (!req.body.uid) {
    return res.status(400).send({ message: "You must be logged in to make this operation!" });
  }
  if (!req.body.activityId) {
    return res.status(400).send({ message: "Activity must have an activity ID!" });
  }
  if (!req.body.activityCollection) {
    return res.status(400).send({ message: "Missing activity collection!" });
  }

  db.collection("users")
    .where("uid", "==", req.body.uid)
    .limit(1)
    .get()
    .then((querySnapshot) => {
      if (querySnapshot.empty) {
        return res.status(404).send({ message: "User not found." });
      }

      querySnapshot.forEach((queryDocumentSnapshot) => {
        queryDocumentSnapshot.ref
          .collection(req.body.activityCollection)
          .doc(req.body.activityId)
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

exports.createByTelegram = (req, res) => {
  if (!req.body.name) {
    return res.status(400).send({ message: "Activity must have a name!" });
  }
  if (!req.body.description) {
    return res.status(400).send({ message: "Activity must have a description!" });
  }
  if (!req.body.tag) {
    return res.status(400).send({ message: "Activity must have an activity tag!" });
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

  db.collection("users")
    .where("telegramHandle", "==", req.body.telegramHandle)
    .limit(1)
    .get()
    .then((querySnapshot) => {
      querySnapshot.forEach((queryDocumentSnapshot) => {
        const userDoc = queryDocumentSnapshot.ref;

        createTemplate(userDoc.id, req.body.name, req.body.description, "02:00", req.body.tag)
          .then((templateActivityDoc) => {
            createPlannedActivity(
              userDoc.id,
              templateActivityDoc.id,
              req.body.startDateTime,
              req.body.endDateTime,
              true
            )
              .then(() => {
                userDoc.update({
                  tags: admin.firestore.FieldValue.arrayUnion(req.body.tag),
                });
                return res.status(200).send({ message: "Planned activity created successfully!" });
              })
              .catch((error) => {
                return res
                  .status(404)
                  .send({ message: `Error creating planned activity. ${error}` });
              });
          })
          .catch((error) => {
            return res.status(404).send({ message: `Error creating template activity. ${error}` });
          });
      });
    })
    .catch((error) => {
      return res
        .status(400)
        .send({ message: `Error getting user database when creating activity. ${error}` });
    });
};
