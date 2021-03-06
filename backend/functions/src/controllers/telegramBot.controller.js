const activityController = require("./activity.controller.js");
const reminderController = require("./reminder.controller.js");

const getAllActivities = activityController.getAllActivitiesExport;
const getAllReminders = reminderController.getAllRemindersExport;

const { Telegraf } = require("telegraf");
const functions = require("firebase-functions");
const admin = require("firebase-admin");
const db = admin.firestore();

const bot = new Telegraf(functions.config().telegram.token);

const retrieveDaily = (chatId) => {
  const convertLocaleDateString = (dateObj) => {
    const padZero = (num) => (num < 10 ? "0" + num.toString() : num.toString());

    const year = dateObj.getFullYear().toString();
    const month = padZero(dateObj.getMonth() + 1);
    const day = padZero(dateObj.getDate());
    const hour = "00";
    const min = "00";
    return year + month + day + hour + min;
  };

  const currentDate = new Date();
  const endDate = new Date();
  endDate.setDate(currentDate.getDate() + 1);

  const promises = [];

  db.collection("users")
    .where("telegramChatId", "==", chatId)
    .limit(1)
    .get()
    .then((querySnapshot) => {
      const plannedActivityQuery = (plannedActivitiesCollection) => {
        return plannedActivitiesCollection
          .where("startDateTime", ">=", convertLocaleDateString(currentDate))
          .where("startDateTime", "<=", convertLocaleDateString(endDate));
      };

      promises.push(
        getAllActivities(querySnapshot, plannedActivityQuery)
          .then((results) => {
            return [].concat.apply([], results);
          })
          .catch(() => {})
      );

      const plannedRangeQuery = (plannedRecurringCollection) => {
        return plannedRecurringCollection
          .where("endDateTime", ">=", convertLocaleDateString(currentDate))
          .where("endDateTime", "<=", convertLocaleDateString(endDate));
      };

      const userDoc = querySnapshot.docs[0].ref;

      promises.push(
        getAllReminders(userDoc, plannedRangeQuery)
          .then((results) => {
            return [].concat.apply([], results);
          })
          .catch(() => {})
      );

      Promise.all(promises)
        .then((results) => {
          const activityArr = results[0].map((activity) => {
            if (activity.activityType === "planned") {
              return `${activity.name} : ${activity.startDateTime.slice(
                8,
                12
              )} - ${activity.endDateTime.slice(8, 12)}`;
            } else {
              if (activity.frequency === "monthly" && activity.date === currentDate.getDate()) {
                return `${activity.name} : ${activity.startTime} - ${activity.endTime}`;
              }

              if (activity.frequency === "weekly" && currentDate.getDay() === activity.date) {
                return `${activity.name} : ${activity.startTime} - ${activity.endTime}`;
              }

              return "";
            }
          });
          const reminderArr = results[1].map((reminder) => {
            if (reminder.reminderType === "planned") {
              return `${reminder.name} : ${reminder.endDateTime.slice(8, 12)}`;
            } else {
              if (reminder.frequency === "monthly" && reminder.date === currentDate.getDate()) {
                return `${reminder.name} : ${reminder.endTime}`;
              }

              if (reminder.frequency === "weekly" && currentDate.getDay() === reminder.date) {
                return `${reminder.name} : ${reminder.endTime}`;
              }

              return "";
            }
          });
          bot.telegram.sendMessage(
            chatId,
            "Here are your activities for the day.\n" +
              activityArr.filter((str) => str !== "").join("\n") +
              "\n Here are your reminders for the day.\n" +
              reminderArr.filter((str) => str !== "").join("\n")
          );
        })
        .catch((e) => {
          bot.telegram.sendMessage(chatId, e.toString());
        });
    });
};

exports.sendReminders = async (req, res) => {
  let ChatIds = [];

  await db
    .collection("users")
    .where("telegramSendReminders", "==", true)
    .get()
    .then((data) => {
      if (data.empty) {
        res.send({});
        return res.status(400).send({ message: "Is empty" });
      } else {
        data.forEach((doc) => {
          const chatId = doc.get("telegramChatId");
          if (chatId != "") {
            ChatIds.push(doc.get("telegramChatId"));
          }
        });
      }
    });
  ChatIds.forEach(async (chatId) => {
    await retrieveDaily(chatId);
  });
  return res.status(200).send();
};
