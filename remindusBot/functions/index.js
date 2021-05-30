const functions = require("firebase-functions");
const { Telegraf } = require("telegraf");
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
  ctx.reply(`Hello ${user.username}! Welcome to the remiNdUS telegram bot!`);
});

// Proof of concept, will interact with firebase backend later on through APIs
bot.command("/testAPI", (ctx) =>
  axios
    .get("http://api.nusmods.com/v2/2020-2021/modules/CS1101S.json")
    .then((res) => ctx.reply(res.data.description))
);

// copy every message and send to the user
bot.on("message", (ctx) => ctx.telegram.sendCopy(ctx.chat.id, ctx.message));

// handle all telegram updates with HTTPs trigger
exports.remiNdUSBot = functions.region("asia-southeast2").https.onRequest((request, response) => {
  return bot
    .handleUpdate(request.body, response)
    .then((rv) => {
      return !rv && response.sendStatus(200);
    })
    .catch((err) => console.log(err));
});
