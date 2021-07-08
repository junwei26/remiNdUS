const admin = require("firebase-admin");
const db = admin.firestore();

// reminderCollection should be "plannedReminders" or "recurringReminders"
const getReminder = (userDoc, reminderId, reminderCollection, subscribed) => {
  return userDoc
    .collection(reminderCollection)
    .doc(reminderId)
    .get()
    .then((documentSnapshot) => {
      return userDoc
        .collection("templateReminders")
        .doc(documentSnapshot.get("templateReminderId"))
        .get()
        .then((templateDocumentSnapshot) => {
          const reminderType = reminderCollection === "plannedReminders" ? "planned" : "recurring";
          return {
            ...documentSnapshot.data(),
            ...templateDocumentSnapshot.data(),
            reminderType,
            reminderId,
            subscribed,
          };
        })
        .catch((error) => {
          throw `Unable to retrieve template reminder. ${error}`;
        });
    })
    .catch((error) => {
      throw `Unable to retrieve ${reminderCollection}. ${error}`;
    });
};

// Helper for getSubscribedPackages and get query
const getRemindersByIds = (uid, plannedReminderIds, recurringReminderIds, subscribed) => {
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
      let reminders = [];

      querySnapshot.forEach((queryDocumentSnapshot) => {
        for (let i = 0; i < plannedReminderIds.length; ++i) {
          promises.push(
            getReminder(
              queryDocumentSnapshot.ref,
              plannedReminderIds[i],
              "plannedReminders",
              subscribed
            )
          );
        }
        for (let i = 0; i < recurringReminderIds.length; ++i) {
          promises.push(
            getReminder(
              queryDocumentSnapshot.ref,
              recurringReminderIds[i],
              "recurringReminders",
              subscribed
            )
          );
        }
      });
      return Promise.all(promises).then((values) => {
        reminders = [].concat.apply([], values);
        return reminders;
      });
    })
    .catch((error) => {
      throw error;
    });
};

const getAllReminders = (userQuerySnapshot) => {
  let promises = [];

  userQuerySnapshot.forEach((queryDocumentSnapshot) => {
    const userDoc = queryDocumentSnapshot.ref;
    promises.push(
      userDoc
        .collection("plannedReminders")
        .get()
        .then((querySnapshot) => {
          const plannedReminderIds = querySnapshot.docs.map(
            (queryDocumentSnapshot) => queryDocumentSnapshot.id
          );
          return userDoc
            .collection("recurringReminders")
            .get()
            .then((querySnapshot) => {
              const recurringReminderIds = querySnapshot.docs.map(
                (queryDocumentSnapshot) => queryDocumentSnapshot.id
              );

              return getRemindersByIds(userDoc, plannedReminderIds, recurringReminderIds, false);
            });
        })
    );
    return Promise.all(promises);
  });
};

// Helper for getSubscribedPackages. Returns packageReminderIds for given user
const getPackageReminderIds = (uid, reminderPackageId) => {
  return db
    .collection("users")
    .where("uid", "==", uid)
    .limit(1)
    .get()
    .then((querySnapshot) => {
      if (querySnapshot.empty) {
        throw "No user found. Please contact the administrator";
      }

      let reminderIds = [];
      let promises = [];

      querySnapshot.forEach((queryDocumentSnapshot) => {
        promises.push(
          queryDocumentSnapshot.ref
            .collection("reminderPackages")
            .doc(reminderPackageId)
            .get()
            .then((documentSnapshot) => {
              return {
                plannedReminderIds: documentSnapshot.get("plannedReminderIds"),
                recurringReminderIds: documentSnapshot.get("recurringReminderIds"),
              };
            })
        );
      });

      return Promise.all(promises).then((values) => {
        reminderIds = [].concat.apply([], values);
        let plannedReminderIds = [];
        let recurringReminderIds = [];
        reminderIds.map((packageReminderIds) => {
          plannedReminderIds = plannedReminderIds.concat(packageReminderIds.plannedReminderIds);
          recurringReminderIds = recurringReminderIds.concat(
            packageReminderIds.recurringReminderIds
          );
          return packageReminderIds;
        });

        return { plannedReminderIds, recurringReminderIds };
      });
    });
};

const getSubscribed = (
  uid,
  reminderFilter = () => {
    return true;
  }
) => {
  return db
    .collection("users")
    .where("uid", "==", uid)
    .limit(1)
    .get()
    .then((querySnapshot) => {
      if (querySnapshot.empty) {
        throw new Error("No user found. Please contact the administrator");
      }

      let subscribedPackages = [];

      let promise = null;

      querySnapshot.forEach((queryDocumentSnapshot) => {
        // Note there is only one promise because there is only one user
        promise = queryDocumentSnapshot.ref
          .collection("subscribedPackages")
          .get()
          .then((querySnapshot) => {
            subscribedPackages = querySnapshot.docs;

            let allSubscribedReminders = [];
            let promises = [];

            for (let i = 0; i < subscribedPackages.length; ++i) {
              const subscribedPackage = subscribedPackages[i].data();
              promises.push(
                getPackageReminderIds(
                  subscribedPackage.userUid,
                  subscribedPackage.reminderPackageId
                ).then((reminderIds) => {
                  return getRemindersByIds(
                    subscribedPackage.userUid,
                    reminderIds.plannedReminderIds,
                    reminderIds.recurringReminderIds,
                    true
                  ).then((subscribedReminders) => {
                    return subscribedReminders;
                  });
                })
              );
            }
            return Promise.all(promises).then((values) => {
              allSubscribedReminders = [].concat.apply([], values);
              return allSubscribedReminders.filter(reminderFilter);
            });
          });
      });
      return promise;
    });
};

exports.getAll = (req, res) => {
  db.collection("users")
    .where("uid", "==", req.query.uid)
    .limit(1)
    .get()
    .then((querySnapshot) => {
      if (querySnapshot.empty) {
        return res.status(404).send({ message: "No user found. Please contact the administrator" });
      }

      let reminders = [];

      querySnapshot.forEach((queryDocumentSnapshot) => {
        queryDocumentSnapshot.ref
          .collection("reminders")
          .get()
          .then((querySnapshot) => {
            getAllReminders(querySnapshot)
              .then((results) => {
                reminders = [].concat.apply([], results);

                getSubscribed(req.query.uid)
                  .then((allSubscribedReminders) => {
                    const allReminders = reminders.concat(allSubscribedReminders);

                    res.send(allReminders);
                    return res.status(200).send({
                      message: "Successfully retrieved all local and subscribed reminders",
                    });
                  })
                  .catch((error) => {
                    return res
                      .status(404)
                      .send({ message: `Error retrieving subscribed reminders. ${error}` });
                  });
              })
              .catch((error) => {
                return res
                  .status(404)
                  .send({ message: `Error retrieving user reminders. ${error}` });
              });
          });
      });
    })
    .catch((error) => {
      return res.status(404).send({ message: `Error retrieving reminders. ${error}` });
    });
};

exports.get = (req, res) => {
  if (!req.query.uid) {
    return res.status(400).send({ message: "You must be logged in to make this operation!" });
  }
  if (!req.query.reminderIds || req.query.reminderIds.length === 0) {
    return res.status(400).send({ message: "Reminders must have reminder IDs!" });
  }

  return getRemindersByIds(
    req.query.uid,
    req.query.reminderIds.plannedReminderIds,
    req.query.reminderIds.recurringReminderIds,
    false
  )
    .then((reminders) => {
      res.send(reminders);
      return res.status(200).send();
    })
    .catch((error) => {
      return res.status(404).send({ message: `Error getting reminders. ${error}` });
    });
};

exports.getTemplateReminders = (req, res) => {
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
          .collection("templateReminders")
          .get()
          .then((querySnapshot) => {
            res.send(
              querySnapshot.docs.map((doc) => {
                return { ...doc.data(), templateReminderId: doc.id };
              })
            );
            return res.status(200).send({ message: "Template reminders retrieved successfully" });
          });
      });
    })
    .catch((error) => {
      return res
        .status(400)
        .send({ message: `Issue getting template reminders from user. ${error}` });
    });
};

exports.getSubscribed = (req, res) => {
  if (!req.query.uid) {
    return res.status(400).send({ message: "You must be logged in to make this operation!" });
  }

  return getSubscribed(req.query.uid)
    .then((allSubscribedReminders) => {
      res.send(allSubscribedReminders);
      return res.status(200).send({
        message: "Successfully retrieved all reminders from subscribed reminder packages.",
      });
    })
    .catch((error) => {
      return res.status(404).send({ message: `Error retrieving subscribed reminders. ${error}` });
    });
};

exports.range = (req, res) => {
  if (!req.query.uid) {
    return res.status(400).send({ message: "You must be logged in to make this operation!" });
  }
  if (!req.query.currentDateTime) {
    return res.status(400).send({ message: "You must have a valid date time!" });
  }
  const reminders = [];

  db.collection("users")
    .doc(req.query.uid)
    .collection("reminders")
    .where("dateTime", ">=", req.query.currentDateTime)
    .where("dateTime", "<=", req.query.endDateTime)
    .get()
    .then((querySnapshot) => {
      querySnapshot.forEach((reminder) => {
        reminders.push({ ...reminder.data(), reminderId: reminder.id, subscribed: false });
      });

      getSubscribed(req.query.uid, (reminder) => {
        return (
          reminder.dateTime >= req.query.currentDateTime &&
          reminder.dateTime <= req.query.endDateTime
        );
      })
        .then((allSubscribedReminders) => {
          const allReminders = reminders.concat(allSubscribedReminders);

          res.send(allReminders);
          return res
            .status(200)
            .send({ message: "Successfully retrieved all local and subscribed reminders" });
        })
        .catch((error) => {
          return res
            .status(404)
            .send({ message: `Error retrieving subscribed reminders. ${error}` });
        });
    });
};

// access the new document by using createTemplate(...).then((templateReminderDoc) => {...})
const createTemplate = (uid, name, description, defaultLength) => {
  return db
    .collection("users")
    .doc(uid)
    .collection("templateReminders")
    .add({ name, description, defaultLength, eventType: "2" });
};

// access the new document by using createPlannedReminder(...).then((plannedReminderDoc) => {...})
const createPlannedReminder = (uid, templateReminderId, endDateTime, active) => {
  return db
    .collection("users")
    .doc(uid)
    .collection("plannedReminders")
    .add({ templateReminderId, endDateTime, active });
};

// If frequency is weekly, take date as 1-7 (Mon, Tue, ..., Sun). If frequency is monthly, take date as 1-31
const createRecurringReminder = (uid, templateReminderId, frequency, endTime, date, active) => {
  return db
    .collection("users")
    .doc(uid)
    .collection("recurringReminders")
    .add({ templateReminderId, frequency, endTime, date, active });
};

/*
uid: mandatory
active: mandatory
templateReminderId: required if not creating new templateReminder
name: required if creating new templateReminder
description: required if creating new templateReminder
endDateTime: required if creating plannedReminder
frequency: required if creating recurringReminder
endTime: required if creating recurringReminder
date: required if creating recurringReminder
*/
exports.create = (req, res) => {
  if (!req.body.uid) {
    return res.status(400).send({ message: "You must be logged in to make this operation!" });
  }
  if (!req.body.active) {
    return res.status(400).send({ message: "Reminder must have an active setting" });
  }
  // If no templateReminderId provided, assume creating a brand new reminder
  if (!req.body.templateReminderId) {
    if (!req.body.name) {
      return res.status(400).send({ message: "Reminders must have a name!" });
    }
    if (!req.body.description) {
      return res.status(400).send({ message: "Reminders must have a description!" });
    }
    if (!req.body.defaultLength) {
      return res.status(400).send({ message: "Reminders must have a default length" });
    }

    // If there is no frequency specified, it is a planned reminder, not recurring
    if (!req.body.frequency) {
      if (!req.body.endDateTime) {
        return res.status(400).send({ message: "Planned reminder must have an end date and time" });
      }
      createTemplate(req.body.uid, req.body.name, req.body.description, req.body.defaultLength)
        .then((templateReminderDoc) => {
          createPlannedReminder(
            req.body.uid,
            templateReminderDoc.id,
            req.body.endDateTime,
            req.body.active
          )
            .then(() => {
              return res.status(200).send({ message: "Planned reminder created successfully!" });
            })
            .catch((error) => {
              return res.status(404).send({ message: `Error creating planned reminder. ${error}` });
            });
        })
        .catch((error) => {
          return res.status(404).send({ message: `Error creating template reminder. ${error}` });
        });
    } else {
      if (!req.body.endTime) {
        return res.status(400).send({ message: "Recurring reminder must have an end time" });
      }
      if (!req.body.date) {
        return res.status(400).send({ message: "Recurring reminder must have a date" });
      }
      createTemplate(req.body.uid, req.body.name, req.body.description, req.body.defaultLength)
        .then((templateReminderDoc) => {
          createRecurringReminder(
            req.body.uid,
            templateReminderDoc.id,
            req.body.frequency,
            req.body.endTime,
            req.body.date,
            req.body.active
          )
            .then(() => {
              return res.status(200).send({ message: "Recurring reminder created successfully!" });
            })
            .catch((error) => {
              return res
                .status(404)
                .send({ message: `Error creating recurring reminder. ${error}` });
            });
        })
        .catch((error) => {
          return res.status(404).send({ message: `Error creating template reminder. ${error}` });
        });
    }
  } else {
    // If there is no frequency specified, it is a planned reminder, not recurring
    if (!req.body.frequency) {
      if (!req.body.endDateTime) {
        return res.status(400).send({ message: "Planned reminder must have an end date and time" });
      }
      createPlannedReminder(
        req.body.uid,
        req.body.templateReminderId,
        req.body.endDateTime,
        req.body.active
      )
        .then(() => {
          return res.status(200).send({ message: "Planned reminder created successfully!" });
        })
        .catch((error) => {
          return res.status(404).send({ message: `Error creating planned reminder. ${error}` });
        });
    } else {
      if (!req.body.endTime) {
        return res.status(400).send({ message: "Recurring reminder must have an active setting" });
      }
      if (!req.body.date) {
        return res.status(400).send({ message: "Recurring reminder must have a date" });
      }
      createRecurringReminder(
        req.body.uid,
        req.body.templateReminderId,
        req.body.frequency,
        req.body.endTime,
        req.body.date,
        req.body.active
      )
        .then(() => {
          return res.status(200).send({ message: "Recurring reminder created successfully!" });
        })
        .catch((error) => {
          return res.status(404).send({ message: `Error creating recurring reminder. ${error}` });
        });
    }
  }
};

exports.update = (req, res) => {
  let updatedReminder = {};

  if (!req.body.uid) {
    return res.status(400).send({ message: "You must be logged in to make this operation!" });
  }
  if (!req.body.active) {
    return res.status(400).send({ message: "Reminder must have an active setting" });
  }
  if (!req.body.reminderId) {
    return res.status(400).send({ message: "Reminder must have an Id!" });
  }
  if (!req.body.templateReminderId) {
    return res.status(400).send({ message: "Base/template reminder not specified!" });
  }
  if (req.body.reminderCollection === "plannedReminders") {
    if (!req.body.endDateTime) {
      return res.status(400).send({ message: "Planned reminder must have an end date and time" });
    }
    updatedReminder = {
      templateReminderId: req.body.templateReminderId,
      endDateTime: req.body.endDateTime,
      active: req.body.active,
    };
  } else if (req.body.reminderCollection === "recurringReminders") {
    if (!req.body.frequency) {
      return res.status(400).send({ message: "Recurring reminder must have a set frequency" });
    }
    if (!req.body.endTime) {
      return res.status(400).send({ message: "Recurring reminder must have an active setting" });
    }
    if (!req.body.date) {
      return res.status(400).send({ message: "Recurring reminder must have a date" });
    }

    updatedReminder = {
      templateReminderId: req.body.templateReminderId,
      frequency: req.body.frequency,
      endTime: req.body.endTime,
      date: req.body.date,
      active: req.body.active,
    };
  } else if (req.body.reminderCollection === "templateReminders") {
    if (!req.body.name) {
      return res.status(400).send({ message: "Template reminder must have a name!" });
    }
    if (!req.body.description) {
      return res.status(400).send({ message: "Template reminder must have a description!" });
    }
    if (!req.body.defaultLength) {
      return res
        .status(400)
        .send({ message: "Template reminder must have an associated default length!" });
    }

    updatedReminder = {
      name: req.body.name,
      description: req.body.description,
      defaultLength: req.body.defaultLength,
      eventType: "2",
    };
  }

  db.collection("users")
    .where("uid", "==", req.body.uid)
    .limit(1)
    .get()
    .then((querySnapshot) =>
      querySnapshot.forEach((queryDocumentSnapshot) =>
        queryDocumentSnapshot.ref
          .collection(req.body.reminderCollection)
          .doc(req.body.reminderId)
          .update(updatedReminder)
          .then(() => {
            return res.status(200).send({ message: "Successfully updated reminder!" });
          })
      )
    )
    .catch((error) => {
      return res.status(404).send({ message: `Error updating reminder. ${error}` });
    });
};

exports.delete = (req, res) => {
  if (!req.query.uid) {
    return res.status(400).send({ message: "You must be logged in to make this operation!" });
  }
  if (!req.query.reminderId) {
    return res.status(400).send({ message: "Reminder must have a reminder ID!" });
  }

  db.collection("users")
    .where("uid", "==", req.query.uid)
    .limit(1)
    .get()
    .then((querySnapshot) => {
      if (querySnapshot.empty) {
        return res.status(404).send({ message: "No user found. Please contact the administrator" });
      }
      querySnapshot.forEach((queryDocumentSnapshot) => {
        queryDocumentSnapshot.ref
          .collection("reminders")
          .doc(req.query.reminderId)
          .delete()
          .then(() => {
            return res.status(200).send({ message: "Successfully deleted reminder!" });
          })
          .catch((error) => {
            return res.status(404).send({ message: `Error deleting reminder. ${error}` });
          });
      });
    });
};
