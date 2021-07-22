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

exports.getAllActivitiesExport = (userQuerySnapshot, plannedActivityQuery = (x) => x) => {
  return getAllActivities(userQuerySnapshot, plannedActivityQuery);
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
  if (!req.query.endDateTime) {
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

  // generate recurring activities
};

// access the new document by using createTemplate(...).then((templateReminderDoc) => {...})
const createTemplate = (uid, name, description, activityTag) => {
  return db
    .collection("users")
    .doc(uid)
    .collection("templateActivities")
    .add({ name, description, activityTag, eventType: "1" });
};

// access the new document by using createPlannedReminder(...).then((plannedReminderDoc) => {...})
const createPlannedActivity = (uid, templateActivityId, startDateTime, endDateTime) => {
  return db
    .collection("users")
    .doc(uid)
    .collection("plannedActivities")
    .add({ templateActivityId, startDateTime, endDateTime });
};

// If frequency is weekly, take date as 1-7 (Mon, Tue, ..., Sun). If frequency is monthly, take date as 1-31
const createRecurringActivity = (uid, templateActivityId, frequency, startTime, endTime, date) => {
  return db
    .collection("users")
    .doc(uid)
    .collection("recurringActivities")
    .add({ templateActivityId, frequency, startTime, endTime, date });
};

const createActivity = (body, uid) => {
  if (Array.isArray(body)) {
    console.log(body);
    // Only used for confirmed, first activity is confirmed to create a new templateActivity
    // Actually only supports recurring activities now since this is only used for retrieving activities from NUSMODs

    if (!uid) {
      throw { status: 400, message: "You must be logged in to make this operation!" };
    }
    if (!body[0].name) {
      throw { status: 400, message: "Activities must have a name!" };
    }
    if (!body[0].description) {
      throw { status: 400, message: "Activities must have a description!" };
    }
    if (!body[0].activityTag) {
      throw { status: 400, message: "Activities must have an activity tag" };
    }
    let promises = [];
    return createTemplate(uid, body[0].name, body[0].description, body[0].activityTag)
      .then((templateActivityDoc) => {
        for (let i = 0; i < body.length; ++i) {
          if (!body[i].frequency) {
            throw { status: 400, message: "Recurring activity must have a frequency" };
          }
          if (!body[i].startTime) {
            throw { status: 400, message: "Recurring activity must have a start time" };
          }
          if (!body[i].endTime) {
            throw { status: 400, message: "Recurring activity must have an end time" };
          }
          if (!body[i].date) {
            throw { status: 400, message: "Recurring activity must have a date" };
          }

          promises.push(
            createRecurringActivity(
              uid,
              templateActivityDoc.id,
              body[i].frequency,
              body[i].startTime,
              body[i].endTime,
              body[i].date
            )
              .then(() => {})
              .catch((error) => {
                throw { status: 404, message: `Error creating recurring activity. ${error}` };
              })
          );
        }
        return Promise.all(promises)
          .then(() => {
            return {
              status: 200,
              message: "Recurring activities created successfully!",
            };
          })
          .catch((error) => {
            throw error;
          });
      })
      .catch((error) => {
        throw { status: 404, message: `Error creating template activity. ${error}` };
      });
  } else {
    if (!uid) {
      throw { status: 400, message: "You must be logged in to make this operation!" };
    }

    // If no templateActivityId provided, assume creating a brand new activity
    if (!body.templateActivityId) {
      if (!body.name) {
        throw { status: 400, message: "Activities must have a name!" };
      }
      if (!body.description) {
        throw { status: 400, message: "Activities must have a description!" };
      }
      if (!body.activityTag) {
        throw { status: 400, message: "Activities must have an activity tag" };
      }

      // If there is no frequency specified, it is a planned activity, not recurring
      if (!body.frequency) {
        if (!body.startDateTime) {
          throw { status: 400, message: "Planned Activity must have a start date and time" };
        }
        if (!body.endDateTime) {
          throw { status: 400, message: "Planned activity must have an end date and time" };
        }

        if (body.endDateTime < body.startDateTime) {
          throw { status: 400, message: "Activity start time must be before activity end time!" };
        }
        return createTemplate(uid, body.name, body.description, body.activityTag)
          .then((templateActivityDoc) => {
            return createPlannedActivity(
              uid,
              templateActivityDoc.id,
              body.startDateTime,
              body.endDateTime
            )
              .then(() => {
                return {
                  status: 200,
                  message: "Planned activity created successfully!",
                  templateId: templateActivityDoc.id,
                };
              })
              .catch((error) => {
                throw { status: 404, message: `Error creating planned activity. ${error}` };
              });
          })
          .catch((error) => {
            throw { status: 404, message: `Error creating template activity. ${error}` };
          });
      } else {
        if (!body.startTime) {
          throw { status: 400, message: "Recurring activity must have a start time" };
        }
        if (!body.endTime) {
          throw { status: 400, message: "Recurring activity must have an end time" };
        }
        if (!body.date) {
          throw { status: 400, message: "Recurring activity must have a date" };
        }
        return createTemplate(uid, body.name, body.description, body.activityTag)
          .then((templateActivityDoc) => {
            return createRecurringActivity(
              uid,
              templateActivityDoc.id,
              body.frequency,
              body.startTime,
              body.endTime,
              body.date
            )
              .then(() => {
                return {
                  status: 200,
                  message: "Recurring activity created successfully!",
                };
              })
              .catch((error) => {
                throw { status: 404, message: `Error creating recurring activity. ${error}` };
              });
          })
          .catch((error) => {
            throw { status: 404, message: `Error creating template activity. ${error}` };
          });
      }
    } else {
      // If there is no frequency specified, it is a planned activity, not recurring
      if (!body.frequency) {
        if (!body.startDateTime) {
          throw { status: 400, message: "Planned Activity must have a start date and time" };
        }
        if (!body.endDateTime) {
          throw { status: 400, message: "Planned activity must have an end date and time" };
        }
        return createPlannedActivity(
          uid,
          body.templateActivityId,
          body.startDateTime,
          body.endDateTime
        )
          .then(() => {
            return { status: 200, message: "Planned activity created successfully!" };
          })
          .catch((error) => {
            throw { status: 404, message: `Error creating planned activity. ${error}` };
          });
      } else {
        if (!body.startTime) {
          throw { status: 400, message: "Recurring activity must have a start time" };
        }
        if (!body.endTime) {
          throw { status: 400, message: "Recurring activity must have an end time" };
        }
        if (!body.date) {
          throw { status: 400, message: "Recurring activity must have a date" };
        }
        return createRecurringActivity(
          uid,
          body.templateActivityId,
          body.frequency,
          body.startTime,
          body.endTime,
          body.date
        )
          .then(() => {
            return { status: 200, message: "Recurring activity created successfully!" };
          })
          .catch((error) => {
            throw { status: 400, message: `Error creating recurring activity. ${error}` };
          });
      }
    }
  }
};

/*
uid: mandatory
templateActivityId: required if not creating new templateActivity
name: required if creating new templateActivity
description: required if creating new templateActivity
frequency: required if creating recurringActivity
startTime: required if creating recurringActivity
endTime: required if creating recurringActivity
date: required if creating recurringActivity
startDateTime: required if creating plannedActivity
endDateTime: required if creating plannedActivity
*/
exports.create = (req, res) => {
  if (!req.body.activities) {
    createActivity(req.body, req.body.uid)
      .then((result) => {
        return res.status(result.status).send(result.message);
      })
      .catch((result) => {
        return res.status(result.status).send(result.message);
      });
  } else {
    let promises = [];
    for (let i = 0; i < req.body.activities.length; ++i) {
      console.log(i);
      console.log(req.body.activities.length);
      promises.push(
        createActivity(req.body.activities[i], req.body.uid)
          .then(() => {})
          .catch((error) => {
            throw error;
          })
      );
    }
    Promise.all(promises)
      .then(() => {
        return res.status(200).send("Activities successfully created");
      })
      .catch((error) => {
        return res.status(error.status).send(error.message);
      });
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
      return res.status(200).send({ message: "Successfully updated activity!" });
    })
    .catch((error) => {
      return res.status(404).send({ message: `Error updating activity. ${error}` });
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
  if (!req.body.activityTag) {
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

        createTemplate(userDoc.id, req.body.name, req.body.description, req.body.activityTag)
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
                  tags: admin.firestore.FieldValue.arrayUnion(req.body.activityTag),
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
