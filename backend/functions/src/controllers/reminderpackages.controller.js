const admin = require("firebase-admin");
const db = admin.firestore();

const convertDateToString = (date) => {
  return `${date.getFullYear().toString().padStart(4, "0")}${(date.getMonth() + 1)
    .toString()
    .padStart(2, "0")}${date.getDate().toString().padStart(2, "0")}${date
    .getHours()
    .toString()
    .padStart(2, "0")}${date.getMinutes().toString().padStart(2, "0")}`;
};

const getSubscribedPackages = (userDoc) => {
  return userDoc
    .collection("subscribedPackages")
    .get()
    .then((querySnapshot) => {
      let promises = [];

      querySnapshot.forEach((queryDocumentSnapshot) => {
        const subscribedPackage = queryDocumentSnapshot.data();

        promises.push(
          db
            .collection("users")
            .where("uid", "==", subscribedPackage.ownerUid)
            .limit(1)
            .get()
            .then((querySnapshot) => {
              if (querySnapshot.empty) {
                throw "No user found. Please contact the administrator";
              }

              const userDoc = querySnapshot.docs[0].ref;
              return userDoc
                .collection("reminderPackages")
                .doc(subscribedPackage.reminderPackageId)
                .get()
                .then((reminderPackageDocumentSnapshot) => {
                  return {
                    ...reminderPackageDocumentSnapshot.data(),
                    subscribed: true,
                  };
                });
            })
        );
      });

      return Promise.all(promises).then((reminderPackagesArray) => {
        return reminderPackagesArray;
      });
    })
    .catch((error) => {
      throw `Subscribed packages could not be received. ${error}`;
    });
};

exports.getAll = (req, res) => {
  if (!req.query.uid) {
    return res.status(400).send({ message: "You must be logged in to make this operation!" });
  }

  db.collection("users")
    .where("uid", "==", req.query.uid)
    .limit(1)
    .get()
    .then((querySnapshot) => {
      if (querySnapshot.empty) {
        return res.status(404).send({ message: "No user found. Please contact the administrator" });
      }

      const userDoc = querySnapshot.docs[0].ref;

      let packageList = [];

      // Actually only one doc (one user)
      userDoc
        .collection("reminderPackages")
        .get()
        .then((querySnapshot) => {
          if (querySnapshot.empty) {
            res.send([]);
            return res.status(200).send({ message: "No Reminder Packages found." });
          }

          // For each reminder package, send its uid as well (doc.id)
          querySnapshot.forEach((queryDocumentSnapshot) => {
            packageList.push({
              ...queryDocumentSnapshot.data(),
              reminderPackageId: queryDocumentSnapshot.id,
            });
          });

          getSubscribedPackages(userDoc).then((subscribedPackages) => {
            const fullPackageList = packageList.concat(subscribedPackages);

            res.send(fullPackageList);
            return res.status(200).send({
              message: "Reminder packages successfully retrieved!",
            });
          });
        })
        .catch((error) => {
          return res.status(400).send({
            message: `Error retrieving reminder packages. ${error}`,
          });
        });
    })
    .catch((error) => {
      return res.status(400).send({
        message: `Error retrieving user details. ${error}`,
      });
    });
};

exports.getPublicPackages = (req, res) => {
  if (!req.query.uid) {
    return res.status(400).send({ message: "You must be logged in to make this operation!" });
  }

  let promises = [];
  const userSubscribedPackages = db
    .collection("users")
    .doc(req.query.uid)
    .collection("subscribedPackages");

  userSubscribedPackages.get().then((querySnapshot) => {
    const subscribedPackages = querySnapshot.docs.map((queryDocumentSnapshot) =>
      queryDocumentSnapshot.data()
    );
    const subscribedOwnerUids = subscribedPackages.map(
      (subscribedPackage) => subscribedPackage.ownerUid
    );
    const subscribedPackageIds = subscribedPackages.map(
      (subscribedPackage) => subscribedPackage.reminderPackageId
    );

    db.collection("users")
      .get()
      .then((querySnapshot) => {
        const userDocArray = querySnapshot.docs.map(
          (queryDocumentSnapshot) => queryDocumentSnapshot.ref
        );
        for (let i = 0; i < userDocArray.length; ++i) {
          promises.push(
            userDocArray[i]
              .collection("reminderPackages")
              .where("public", "==", true)
              .get()
              .then((querySnapshot) => {
                return querySnapshot.docs.map((queryDocumentSnapshot) => {
                  const data = queryDocumentSnapshot.data();
                  let subscribed = false;

                  for (let j = 0; j < subscribedOwnerUids.length; ++j) {
                    if (
                      data.ownerUid == subscribedOwnerUids[j] &&
                      queryDocumentSnapshot.id == subscribedPackageIds[j]
                    ) {
                      console.log("true");
                      subscribed = true;
                    }
                  }

                  return {
                    ...data,
                    reminderPackageId: queryDocumentSnapshot.id,
                    subscribed,
                  };
                });
              })
              .catch((error) => {
                return res
                  .status(400)
                  .send({ message: `Error retrieving reminder packages. ${error}` });
              })
          );
        }

        Promise.all(promises).then((publicPackagesArray) => {
          const publicPackages = [].concat.apply([], publicPackagesArray);
          res.send(publicPackages);
          return res
            .status(200)
            .send({ message: "Public reminder packages successfully retrieved" });
        });
      })
      .catch((error) => {
        return res.status(400).send({ message: `Error retrieving user details. ${error}` });
      });
  });
};

exports.create = (req, res) => {
  if (!req.body.uid) {
    return res.status(400).send({ message: "You must be logged in to make this operation!" });
  }
  if (!req.body.name) {
    return res.status(400).send({ message: "Error! Missing name for reminder package!" });
  }
  if (!req.body.description) {
    return res.status(400).send({ message: "Error! Missing description for reminder package!" });
  }
  if (!req.body.reminderIds) {
    return res.status(400).send({ message: "Error! Missing reminders for reminder package!" });
  }

  db.collection("users")
    .where("uid", "==", req.body.uid)
    .limit(1)
    .get()
    .then((data) => {
      if (data.empty) {
        return res.status(404).send({ message: "No user found. Please contact the administrator" });
      }

      // Only one user, one doc
      data.forEach((querySnapshotDoc) => {
        const userDoc = querySnapshotDoc.ref;
        userDoc
          .get()
          .then((documentSnapshot) => {
            const reminderPackage = {
              name: req.body.name,
              description: req.body.description,
              lastModified: convertDateToString(new Date()),
              numberOfReminders:
                req.body.reminderIds.plannedReminderIds.length +
                req.body.reminderIds.recurringReminderIds.length,
              plannedReminderIds: req.body.reminderIds.plannedReminderIds,
              recurringReminderIds: req.body.reminderIds.recurringReminderIds,
              packageTag: req.body.packageTag,
              ownerUid: req.body.uid,
              ownerName: documentSnapshot.get("username"),
              verified: documentSnapshot.get("verified"),
              public: false,
            };

            userDoc.collection("reminderPackages").add(reminderPackage);
            return res.status(200).send({ message: "Reminder package successfully created!" });
          })
          .catch((error) => {
            return res.status(400).send({
              message: `Error retrieving user verified status and/or name. ${error}`,
            });
          });
      });
    })
    .catch((error) => {
      return res.status(400).send({
        message: `Error retrieving user database. ${error}`,
      });
    });
};

exports.update = (req, res) => {
  if (!req.body.uid) {
    return res.status(400).send({ message: "You must be logged in to make this operation!" });
  }
  if (!req.body.name) {
    return res.status(400).send({ message: "Error! Missing name for reminder package!" });
  }
  if (!req.body.description) {
    return res.status(400).send({ message: "Error! Missing description for reminder package!" });
  }
  if (!req.body.reminderIds) {
    return res.status(400).send({ message: "Error! Missing reminders for reminder package!" });
  }
  if (!req.body.reminderPackageId) {
    return res.status(400).send({ message: "Error! Missing ID for reminder package!" });
  }

  db.collection("users")
    .where("uid", "==", req.body.uid)
    .limit(1)
    .get()
    .then((querySnapshot) => {
      if (querySnapshot.empty) {
        return res.status(404).send({ message: "No user found. Please contact the administrator" });
      }

      const userDoc = querySnapshot.docs[0].ref;

      userDoc.get().then(() => {
        const updatedReminderPackage = {
          name: req.body.name,
          description: req.body.description,
          lastModified: convertDateToString(new Date()),
          numberOfReminders:
            req.body.reminderIds.plannedReminderIds.length +
            req.body.reminderIds.recurringReminderIds.length,
          plannedReminderIds: req.body.reminderIds.plannedReminderIds,
          recurringReminderIds: req.body.reminderIds.recurringReminderIds,
          packageTag: req.body.packageTag,
          ownerUid: req.body.uid,
        };

        userDoc
          .collection("reminderPackages")
          .doc(req.body.reminderPackageId)
          .update(updatedReminderPackage)
          .then(() => {
            return res.status(200).send({ message: "Successfully updated reminder package!" });
          })
          .catch((error) => {
            return res.status(400).send({
              message: `Error updating reminder package. ${error}`,
            });
          });
      });
    })
    .catch((error) => {
      return res.status(400).send({
        message: `Error retrieving user database when updating reminder package. ${error}`,
      });
    });
};

exports.share = (req, res) => {
  if (!req.body.uid) {
    return res.status(400).send({ message: "You must be logged in to make this operation!" });
  }
  if (!req.body.reminderPackageIds) {
    return res.status(400).send({ message: "Reminder must have a reminder ID!" });
  }

  db.collection("users")
    .where("uid", "==", req.body.uid)
    .limit(1)
    .get()
    .then((querySnapshot) => {
      querySnapshot.forEach((queryDocumentSnapshot) => {
        let batch = db.batch();
        let collection = queryDocumentSnapshot.ref.collection("reminderPackages");

        for (let i = 0; i < req.body.reminderPackageIds.length; ++i) {
          batch.update(collection.doc(req.body.reminderPackageIds[i]), { public: req.body.share });
        }

        batch
          .commit()
          .then(() => {
            return req.body.share
              ? res.status(200).send({ message: "Successfully shared reminder package(s)!" })
              : res.status(200).send({ message: "Successfully unshared reminder package(s)!" });
          })
          .catch((error) => {
            return req.body.share
              ? res.status(404).send({ message: `Error sharing reminder package. ${error}` })
              : res.status(404).send({ message: `Error unsharing reminder package. ${error}` });
          });
      });
    })
    .catch((error) => {
      return res.status(400).send({
        message: `Error retrieving user database. ${error}`,
      });
    });
};

exports.subscribe = (req, res) => {
  if (!req.body.uid) {
    return res.status(400).send({ message: "You must be logged in to make this operation!" });
  }
  if (!req.body.ownerUids || req.body.ownerUids.length === 0) {
    return res.status(400).send({ message: "Reminder packages must have accompanying user IDs!" });
  }
  if (!req.body.reminderPackageIds || req.body.reminderPackageIds.length === 0) {
    return res.status(400).send({ message: "Reminder packages must have reminder package IDs!" });
  }
  if (req.body.ownerUids.length != req.body.reminderPackageIds.length) {
    return res.status(400).send({
      message: "Unequal number of user IDs and reminder package IDs!",
    });
  }

  if (req.body.subscribe) {
    db.collection("users")
      .where("uid", "==", req.body.uid)
      .limit(1)
      .get()
      .then((querySnapshot) => {
        querySnapshot.forEach((queryDocumentSnapshot) => {
          let promises = [];

          let collection = queryDocumentSnapshot.ref.collection("subscribedPackages");
          for (let i = 0; i < req.body.ownerUids.length; ++i) {
            promises.push(
              collection
                .where("ownerUid", "==", req.body.ownerUids[i])
                .where("reminderPackageId", "==", req.body.reminderPackageIds[i])
                .get()
                .then((querySnapshot) => {
                  // If a document with exactly the same uid and reminderpackageId already exists (i.e. already subscribed)
                  querySnapshot.size > 0
                    ? Promise.resolve(0)
                    : Promise.all(
                        collection.add({
                          ownerUid: req.body.ownerUids[i],
                          reminderPackageId: req.body.reminderPackageIds[i],
                        })
                      );
                })
                .catch((error) => {
                  return res
                    .status(404)
                    .send({ message: `Error querying subscribed packages. ${error}` });
                })
            );
          }

          Promise.all(promises)
            .then(() => {
              return res
                .status(200)
                .send({ message: `Successfully subscribed to reminder packages.` });
            })
            .catch((error) => {
              return res.status(404).send({
                message: `Error subscribing to packages. ${error}`,
              });
            });
        });
      })
      .catch((error) => {
        return res.status(404).send({
          message: `Error retrieving user database. ${error}`,
        });
      });
  } else {
    db.collection("users")
      .where("uid", "==", req.body.uid)
      .limit(1)
      .get()
      .then((querySnapshot) => {
        querySnapshot.forEach((queryDocumentSnapshot) => {
          let promises = [];

          let collection = queryDocumentSnapshot.ref.collection("subscribedPackages");
          for (let i = 0; i < req.body.ownerUids.length; ++i) {
            promises.push(
              collection
                .where("ownerUid", "==", req.body.ownerUids[i])
                .where("reminderPackageId", "==", req.body.reminderPackageIds[i])
                .get()
                .then((querySnapshot) => {
                  return Promise.all(
                    querySnapshot.docs.map((queryDocumentSnapshot) =>
                      queryDocumentSnapshot.ref.delete()
                    )
                  );
                })
                .catch((error) => {
                  return res
                    .status(404)
                    .send({ message: `Error querying subscribed packages. ${error}` });
                })
            );
          }

          Promise.all(promises)
            .then(() => {
              return res
                .status(200)
                .send({ message: `Successfully unsubscribed from reminder packages.` });
            })
            .catch((error) => {
              return res.status(404).send({
                message: `Error unsubscribing to packages. ${error}`,
              });
            });
        });
      })
      .catch((error) => {
        return res.status(404).send({
          message: `Error retrieving user database. ${error}`,
        });
      });
  }
};

exports.delete = (req, res) => {
  if (!req.body.uid) {
    return res.status(400).send({ message: "You must be logged in to make this operation!" });
  }
  if (!req.body.reminderPackageIds) {
    return res.status(400).send({ message: "Reminder packages must have reminder package IDs!" });
  }

  db.collection("users")
    .where("uid", "==", req.body.uid)
    .limit(1)
    .get()
    .then((data) => {
      if (data.empty) {
        return res.status(404).send({ message: "No reminders found." });
      }
      // Note that in the case that the reminder package indicated by the given id does not exist, it still "successfully deletes the reminder package"
      data.forEach((doc) => {
        let batch = db.batch();

        let collection = doc.ref.collection("reminderPackages");
        for (let i = 0; i < req.body.reminderPackageIds.length; ++i) {
          const reminderPackageId = req.body.reminderPackageIds[i];

          batch.delete(collection.doc(reminderPackageId));
        }

        batch
          .commit()
          .then(() => {
            return res.status(200).send({ message: "Successfully deleted reminder package!" });
          })
          .catch((error) => {
            return res.status(404).send({ message: `Error deleting reminder package. ${error}` });
          });
      });
    })
    .catch((error) => {
      return res.status(404).send({
        message: `Error retrieving user database. ${error}`,
      });
    });
};
