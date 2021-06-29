const functions = require("firebase-functions");
const { Telegraf } = require("telegraf");
// const cron = require("node-cron");
const axios = require("axios");

const bot = new Telegraf(functions.config().telegram.token, {
  telegram: { webhookReply: true },
});

bot.telegram.setWebhook("https://asia-southeast2-remindus-76402.cloudfunctions.net/remiNdUSBot");

// error handling
bot.catch((err, ctx) => {
  functions.logger.error("[Bot] Error", err);
  return ctx.reply(`Ooops, encountered an error for ${ctx.updateType}`, err);
});

// initialize the commands
bot.command("/start", async (ctx) => {
  const user = await bot.telegram.getChat(ctx.chat.id);
  ctx.reply(`Hello ${user.username}! Welcome to the remiNdUS telegram bot! Local dev version`);
});

bot.command("/retrieve", async (ctx) => {
  const convertLocaleDateString = (dateStr) => {
    const padZero = (num) => (num < 10 ? "0" + num.toString() : num.toString());

    const date = new Date(dateStr);
    const year = date.getFullYear().toString();
    const month = padZero(date.getMonth() + 1);
    const day = padZero(date.getDate());
    const hour = padZero(date.getHours());
    const min = padZero(date.getMinutes());
    return year + month + day + hour + min;
  };
  const backendURL =
    "https://asia-southeast2-remindus-76402.cloudfunctions.net/backendAPI/api/activity/getByTelegram";

  const user = await bot.telegram.getChat(ctx.chat.id);
  const currentDate = new Date();
  const endDate = new Date();
  endDate.setDate(currentDate.getDate() + 1);
  axios
    .get(backendURL, {
      params: {
        telegramHandle: user.username,
        currentDateTime: convertLocaleDateString(currentDate.toLocaleString()),
        endDateTime: convertLocaleDateString(endDate.toLocaleString()),
      },
    })
    .then((response) => {
      const activityArr = response.data.map(
        (activity) =>
          ` ${activity.name}  (${activity.startDateTime.slice(
            8,
            12
          )} - ${activity.endDateTime.slice(8, 12)})`
      );
      ctx.reply("Here are today's activities." + activityArr.join("."));
    });
});

bot.command("/sendAll", async (ctx) => {
  () => {
    const getTelegramReminderUsersUrl =
      "https://asia-southeast2-remindus-76402.cloudfunctions.net/backendAPI/api/user/getTelegramReminderUsers";

    let telegramHandles = [];

    axios
      .get(getTelegramReminderUsersUrl)
      .then((response) => {
        telegramHandles = response.data;

        const updateURL =
          "https://asia-southeast2-remindus-76402.cloudfunctions.net/backendAPI/api/user/updateTest";

        for (let i = 0; i < telegramHandles.length; ++i) {
          const updatedTest = {
            telegramHandle: telegramHandles[i],
            test: new Date(),
          };
          axios
            .post(updateURL, updatedTest)
            .then(() => {
              ctx.reply(`Updated test to current date on firestore for user ${telegramHandles[i]}`);
            })
            .catch((error) => {
              ctx.reply(
                `Error encountered updating test. Error status code: ${error.response.status}. ${error.response.data.message}`
              );
            });
        }
      })
      .catch(() => {});
  };
});

bot.command("/testReminder", async (ctx) => {
  const updateURL =
    "https://asia-southeast2-remindus-76402.cloudfunctions.net/backendAPI/api/user/updateTest";

  const user = await bot.telegram.getChat(ctx.chat.id);
  const test = new Date();

  const updatedTest = {
    telegramHandle: user.username,
    test: test,
  };

  axios
    .post(updateURL, updatedTest)
    .then(() => {
      ctx.reply(`Updated test to ${test} on firestore`);
    })
    .catch((error) => {
      ctx.reply(
        `Error encountered updating test. Error status code: ${error.response.status}. ${error.response.data.message}`
      );
    });
});

// handle all telegram updates with HTTPs trigger
exports.remiNdUSBot = functions.region("asia-southeast2").https.onRequest((request, response) => {
  return bot
    .handleUpdate(request.body, response)
    .then((rv) => {
      return !rv && response.sendStatus(200);
    })
    .catch((err) => console.log(err));
});

// exports.test = (req, res) => {
//   axios.post();
// };
