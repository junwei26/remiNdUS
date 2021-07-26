const functions = require("firebase-functions");
const { Scenes, session, Telegraf } = require("telegraf");
const Calendar = require("telegraf-calendar-telegram");
const axios = require("axios");
const utils = require("./utils.js");

const bot = new Telegraf(functions.config().telegram.token, {
  telegram: { webhookReply: true },
});

const backendURL = "https://asia-southeast2-remindus-76402.cloudfunctions.net/backendAPI/api";

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
    if (!utils.checkTimeFormat(ctx.message.text)) {
      ctx.reply("Please enter a time in the correct format(HHMM)");
      return;
    }
    if (selectedDate === "") {
      ctx.reply("Please select a date in the calendar");
      return;
    }

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
    ctx.reply("Adding reminder....");
    const user = await bot.telegram.getChat(ctx.chat.id);
    const reminder = {
      telegramHandle: user.username,
      name: ctx.wizard.state.reminder.name,
      description: ctx.wizard.state.reminder.description,
      endDateTime: selectedDate.split("-").join("") + ctx.wizard.state.reminder.time,
    };

    axios
      .post(backendURL + "/reminder/createByTelegram", reminder)
      .then(() => {
        ctx.reply("Reminder added successfully");
        selectedDate = "";
      })
      .catch(() => ctx.reply("Error creating reminder, please try again."));
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
    if (!utils.checkTimeFormat(ctx.message.text)) {
      ctx.reply("Please enter a time in the correct format(HHMM)");
      return;
    }
    if (selectedDate === "") {
      ctx.reply("Please select a date in the calendar");
      return;
    }
    ctx.wizard.state.activity.startTime = ctx.message.text;
    ctx.reply("Please choose an end time (in HHMM format) for your activity");
    return ctx.wizard.next();
  },
  (ctx) => {
    if (!utils.checkTimeFormat(ctx.message.text)) {
      ctx.reply("Please enter a time in the correct format(HHMM)");
      return;
    }
    if (parseInt(ctx.wizard.state.activity.startTime) > parseInt(ctx.message.text)) {
      ctx.reply("Please choose an end time that is after the start time");
      return;
    }
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
    ctx.reply("Adding activity...");
    const user = await bot.telegram.getChat(ctx.chat.id);
    const activity = {
      telegramHandle: user.username,
      name: ctx.wizard.state.activity.name,
      description: ctx.wizard.state.activity.description,
      startDateTime: selectedDate.split("-").join("") + ctx.wizard.state.activity.startTime,
      endDateTime: selectedDate.split("-").join("") + ctx.wizard.state.activity.endTime,
      activityTag: ctx.wizard.state.activity.tag,
    };

    axios
      .post(backendURL + "/activity/createByTelegram", activity)
      .then(() => {
        ctx.reply("Activity added successfully");
        selectedDate = "";
      })
      .catch(() => ctx.reply("Error creating activity, please try again."));
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
  axios
    .post(backendURL + "/user/setChatId", {
      telegramHandle: user.username,
      chatId: ctx.chat.id,
    })
    .then(() => ctx.reply("Successfully Connected to our website!"))
    .catch(() =>
      ctx.reply(
        "Error connecting to website, please do /start again and ensure that your telegram handle is registered on our website"
      )
    );
});

bot.command("/addreminder", (ctx) => ctx.scene.enter("ADD_REMINDER_SCENE"));

bot.command("/addactivity", (ctx) => ctx.scene.enter("ADD_ACTIVITY_SCENE"));

bot.command("/retrieve", async (ctx) => {
  const convertLocaleDateString = (dateObj) => {
    const padZero = (num) => (num < 10 ? "0" + num.toString() : num.toString());
    const year = dateObj.getFullYear().toString();
    const month = padZero(dateObj.getMonth() + 1);
    const day = padZero(dateObj.getDate());
    const hour = "00";
    const min = "00";
    return year + month + day + hour + min;
  };

  const user = await bot.telegram.getChat(ctx.chat.id);
  const currentDate = new Date();
  const endDate = new Date();
  endDate.setDate(currentDate.getDate() + 1);
  axios
    .get(backendURL + "/activity/getByTelegram", {
      params: {
        telegramHandle: user.username,
        currentDateTime: convertLocaleDateString(currentDate),
        endDateTime: convertLocaleDateString(endDate),
      },
    })
    .then((response) => {
      const activityArr = response.data.map((activity) => {
        if (activity.activityType === "planned") {
          return ` ${activity.name} : ${activity.startDateTime.slice(
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
      axios
        .get(backendURL + "/reminder/getByTelegram", {
          params: {
            telegramHandle: user.username,
            currentDateTime: convertLocaleDateString(currentDate),
            endDateTime: convertLocaleDateString(endDate),
          },
        })
        .then((response) => {
          const reminderArr = response.data.map((reminder) => {
            if (reminder.reminderType === "planned") {
              return ` ${reminder.name} : ${reminder.endDateTime.slice(8, 12)}`;
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
          ctx.reply(
            "Here are your activities for today.\n" +
              activityArr.filter((str) => str !== "").join("\n") +
              "\n Here are your reminders for today.\n" +
              reminderArr.filter((str) => str !== "").join("\n")
          );
        })
        .catch((e) => ctx.reply(`Error retrieving reminders from database. ${e}`));
    })
    .catch((e) => ctx.reply(`Error retrieving activities from database. ${e}`));
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
