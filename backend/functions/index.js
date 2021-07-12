const functions = require("firebase-functions");
const admin = require("firebase-admin");
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");

var serviceAccount = require("./remindus-76402-firebase-adminsdk-e2ndz-c0942575bb.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://remindus-76402-default-rtdb.asia-southeast1.firebasedatabase.app",
});

const app = express();

app.use(cors({ origin: true }));

// parse requests of content-type - application/json
app.use(bodyParser.json());

// parse requests of content-type - application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }));

require("./src/routes/reminder.routes")(app);
require("./src/routes/activity.routes")(app);
require("./src/routes/user.routes")(app);
require("./src/routes/reminderpackages.routes")(app);
require("./src/routes/telegramBot.routes")(app);

exports.backendAPIDev = functions.region("asia-southeast2").https.onRequest(app);
