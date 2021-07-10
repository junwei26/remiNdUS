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

exports.getAll = (req, res) => {
  if (!req.query.uid) {
    return res.status(400).send({ message: "You must be logged in to make this operation!" });
  }

  db.collection("users")
    .where("uid", "==", req.query.uid)
    .limit(1)
    .get()
    .then((data) => {
      if (data.empty) {
        return res.status(404).send({ message: "No user found. Please contact the administrator" });
      }

      let packageList = [];

      // Actually only one doc (one user)
      data.forEach((doc) => {
        doc.ref
          .collection("reminderPackages")
          .get()
          .then((data) => {
            if (data.empty) {
              res.send([]);
              return res.status(200).send({ message: "No Reminder Packages found." });
            }

            // For each reminder package, send its uid as well (doc.id)
            data.forEach((doc) => {
              packageList.push({ ...doc.data(), reminderPackageId: doc.id });
            });

            res.send(packageList);
            return res.status(200).send({
              message: "Reminder packages successfully retrieved!",
            });
          })
          .catch((error) => {
            return res.status(400).send({
              message: `Error retrieving reminder packages. ${error}`,
            });
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
  let promises = [];
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
                return {
                  ...queryDocumentSnapshot.data(),
                  reminderPackageId: queryDocumentSnapshot.id,
                };
              });
            })
            .catch((error) => {
              return res.status(400).send({ message: `Error retrieving user details. ${error}` });
            })
        );
      }

      Promise.all(promises).then((publicPackagesArray) => {
        const publicPackages = [].concat.apply([], publicPackagesArray);
        res.send(publicPackages);
        return res.status(200).send({ message: "Public reminder packages successfully retrieved" });
      });
    })
    .catch((error) => {
      return res.status(400).send({ message: `Error retrieving user details. ${error}` });
    });
};

exports.create = (req, res) => {
  if (!req.body.uid) {
    return res.status(400).send({ message: "You must be logged in to make this operation!" });
  }
  if (!req.body.name) {
    return res.status(400).send({ message: "Error! Missing name for reminder package" });
  }
  if (!req.body.description) {
    return res.status(400).send({ message: "Error! Missing description for reminder package" });
  }
  if (!req.body.reminderIds) {
    return res.status(400).send({ message: "Error! Missing reminders for reminder package" });
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
