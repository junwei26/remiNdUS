const admin = require("firebase-admin");
const db = admin.firestore();

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

            // For each reminder package, send its uid as well
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
  let publicPackages = [];
  let promises = [];
  db.collection("users")
    .get()
    .then((querySnapshot) => {
      let userQueryDocSnapshotArr = querySnapshot.docs;
      for (let i = 0; i < userQueryDocSnapshotArr.length; ++i) {
        promises.push(
          userQueryDocSnapshotArr[i].ref
            .collection("reminderPackages")
            .where("public", "==", true)
            .get()
            .then((querySnapshot) => {
              Promise.all(
                querySnapshot.docs.map((queryDocumentSnapshot) =>
                  publicPackages.push(queryDocumentSnapshot.data())
                )
              );
            })
            .catch((error) => {
              return res.status(400).send({ message: `Error retrieving user details. ${error}` });
            })
        );
      }

      Promise.all(promises).then(() => {
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
        const documentRef = querySnapshotDoc.ref;
        documentRef
          .get()
          .then((documentSnapshot) => {
            const reminderPackage = {
              name: req.body.name,
              description: req.body.description,
              lastModified: new Date().getTime(),
              numberOfReminders: req.body.reminderIds.length,
              reminderIds: req.body.reminderIds,
              packageTag: req.body.packageTag,
              ownerUid: req.body.uid,
              ownerName: documentSnapshot.get("username"),
              verified: documentSnapshot.get("verified"),
              public: false,
            };

            documentRef.collection("reminderPackages").add(reminderPackage);
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

exports.delete = (req, res) => {
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
    });
};
