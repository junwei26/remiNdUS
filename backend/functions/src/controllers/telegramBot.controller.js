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
  var activities = [];
  var reminders = [];
  db.collection("users")
    .where("telegramChatId", "==", chatId)
    .limit(1)
    .get()
    .then((data) => {
      data.forEach((doc) => {
        doc.ref
          .collection("activities")
          .where("startDateTime", ">=", convertLocaleDateString(currentDate))
          .where("startDateTime", "<=", convertLocaleDateString(endDate))
          .get()
          .then((querySnapshot) => {
            querySnapshot.forEach((activity) => {
              activities.push(activity.data());
            });
            db.collection("users")
              .where("telegramChatId", "==", chatId)
              .limit(1)
              .get()
              .then((data) => {
                data.forEach((doc) => {
                  doc.ref
                    .collection("reminders")
                    .where("dateTime", ">=", convertLocaleDateString(currentDate))
                    .where("dateTime", "<=", convertLocaleDateString(endDate))
                    .get()
                    .then((querySnapshot) => {
                      querySnapshot.forEach((reminder) => {
                        reminders.push({ reminderId: reminder.id, ...reminder.data() });
                      });
                      const activityArr = activities.map(
                        (activity) =>
                          ` ${activity.name} : ${activity.startDateTime.slice(
                            8,
                            12
                          )} - ${activity.endDateTime.slice(8, 12)}`
                      );
                      const reminderArr = reminders.map(
                        (reminder) => ` ${reminder.name} : ${reminder.dateTime.slice(8, 12)}`
                      );
                      bot.telegram.sendMessage(
                        chatId,
                        "Here are your activities for the day.\n" +
                          activityArr.join("\n") +
                          "\n Here are your reminders for the day.\n" +
                          reminderArr.join("\n")
                      );
                    });
                });
              })
              .catch(() => {});
          });
      });
    })
    .catch(() => {});
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
