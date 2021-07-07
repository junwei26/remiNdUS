const functions = require("firebase-functions");
const { Scenes, session, Telegraf } = require("telegraf");
const Calendar = require("telegraf-calendar-telegram");
const axios = require("axios");

const bot = new Telegraf(functions.config().telegram.token, {
  telegram: { webhookReply: true },
});

let selectedDate = "";
const calendar = new Calendar(bot, {
  startWeekDay: 1,
  weekDayNames: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
  monthNames: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
});
calendar.setDateListener((context, date) => {
  selectedDate = date;
  context.reply("Selected " + date);
});

const addReminderScene = new Scenes.WizardScene(
  "ADD_REMINDER_SCENE",
  (ctx) => {
    ctx.wizard.state.reminder = {};
    const today = new Date();
    const minDate = new Date();
    minDate.setMonth(today.getMonth() - 2);
    const maxDate = new Date();
    maxDate.setMonth(today.getMonth() + 2);
    maxDate.setDate(today.getDate());

    ctx.reply(
      "Please choose a date and enter a time in HHMM format",
      calendar.setMinDate(minDate).setMaxDate(maxDate).getCalendar()
    );
    return ctx.wizard.next();
  },
  (ctx) => {
    ctx.wizard.state.reminder.time = ctx.message.text;
    ctx.reply("Please choose a name for your reminder");
    return ctx.wizard.next();
  },
  (ctx) => {
    ctx.wizard.state.reminder.name = ctx.message.text;
    ctx.reply("Please choose a description for your reminder");
    return ctx.wizard.next();
  },
  async (ctx) => {
    ctx.wizard.state.reminder.description = ctx.message.text;
    ctx.reply("Adding reminder");
    // axios call here
    ctx.reply(
      ctx.wizard.state.reminder.time +
        ctx.wizard.state.reminder.name +
        ctx.wizard.state.reminder.description +
        selectedDate
    );
    return ctx.scene.leave();
  }
);

const addActivityScene = new Scenes.WizardScene(
  "ADD_ACTIVITY_SCENE",
  (ctx) => {
    ctx.wizard.state.activity = {};
    const today = new Date();
    const minDate = new Date();
    minDate.setMonth(today.getMonth() - 2);
    const maxDate = new Date();
    maxDate.setMonth(today.getMonth() + 2);
    maxDate.setDate(today.getDate());

    ctx.reply(
      "Please choose a date and enter a start time (in HHMM format)",
      calendar.setMinDate(minDate).setMaxDate(maxDate).getCalendar()
    );
    return ctx.wizard.next();
  },
  (ctx) => {
    ctx.wizard.state.activity.startTime = ctx.message.text;
    ctx.reply("Please choose an end time (in HHMM format) for your activity");
    return ctx.wizard.next();
  },
  (ctx) => {
    ctx.wizard.state.activity.endTime = ctx.message.text;
    ctx.reply("Please choose a name for your activity");
    return ctx.wizard.next();
  },
  (ctx) => {
    ctx.wizard.state.activity.name = ctx.message.text;
    ctx.reply("Please choose a description for your activity");
    return ctx.wizard.next();
  },
  (ctx) => {
    ctx.wizard.state.activity.description = ctx.message.text;
    ctx.reply("Please choose a tag for your activity");
    return ctx.wizard.next();
  },
  async (ctx) => {
    ctx.wizard.state.activity.tag = ctx.message.text;
    ctx.reply("Adding activity");
    // axios call here
    ctx.reply(
      ctx.wizard.state.activity.name +
        ctx.wizard.state.activity.description +
        ctx.wizard.state.activity.startTime +
        ctx.wizard.state.activity.endTime +
        ctx.wizard.state.activity.tag +
        selectedDate
    );
    return ctx.scene.leave();
  }
);

const stage = new Scenes.Stage([addReminderScene, addActivityScene]);
bot.use(session());
bot.use(stage.middleware());

bot.telegram.setWebhook("https://asia-southeast2-remindus-76402.cloudfunctions.net/remiNdUSBot");

// error handling
bot.catch((err, ctx) => {
  functions.logger.error("[Bot] Error", err);
  return ctx.reply(`Ooops, encountered an error for ${ctx.updateType}`, err);
});

// initialize the commands
bot.command("/start", async (ctx) => {
  const user = await bot.telegram.getChat(ctx.chat.id);
  ctx.reply(`Hello ${user.username}! Welcome to the remiNdUS telegram bot!`);
});

bot.hears("/addReminder", (ctx) => ctx.scene.enter("ADD_REMINDER_SCENE"));

bot.hears("/addActivity", (ctx) => ctx.scene.enter("ADD_ACTIVITY_SCENE"));

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
          ` ${activity.name} : ${activity.startDateTime.slice(
            8,
            12
          )} - ${activity.endDateTime.slice(8, 12)}`
      );
      axios
        .get(
          "https://asia-southeast2-remindus-76402.cloudfunctions.net/backendAPI/api/reminder/getByTelegram",
          {
            params: {
              telegramHandle: user.username,
              currentDateTime: convertLocaleDateString(currentDate.toLocaleString()),
              endDateTime: convertLocaleDateString(endDate.toLocaleString()),
            },
          }
        )
        .then((response) => {
          const reminderArr = response.data.map(
            (reminder) => ` ${reminder.name} : ${reminder.dateTime.slice(8, 12)}`
          );
          ctx.reply(
            "Here are today's activities.\n" +
              activityArr.join("\n") +
              "\n Today's reminders.\n" +
              reminderArr.join("\n")
          );
        });
    });
});

bot.command("/help", (ctx) => {
  ctx.reply(
    "List of commands:\n /addReminder  Adds a reminder to your planner\n /addActivity Adds an activity to your planner\n"
  );
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

// handle all telegram updates with HTTPs trigger
exports.remiNdUSBot = functions.region("asia-southeast2").https.onRequest((request, response) => {
  return bot
    .handleUpdate(request.body, response)
    .then((rv) => {
      return !rv && response.sendStatus(200);
    })
    .catch((err) => console.log(err));
});
