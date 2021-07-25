const parseTimeToString = (dateTime) => {
  if (dateTime) {
    return new Date(
      dateTime.slice(0, 4),
      dateTime.slice(4, 6) - 1,
      dateTime.slice(6, 8),
      dateTime.slice(8, 10),
      dateTime.slice(10, 12)
    ).toLocaleString("en-US");
  }
  return "";
};

const parseTimeToDate = (dateTime) => {
  return new Date(
    dateTime.slice(0, 4),
    dateTime.slice(4, 6) - 1,
    dateTime.slice(6, 8),
    dateTime.slice(8, 10),
    dateTime.slice(10, 12)
  );
};

const dates = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dev"];

const convertDateToShorterString = (date) => {
  if (date) {
    return `${date.getDate().toString().padStart(2, "0")} ${dates[date.getMonth() + 1]} ${date
      .getHours()
      .toString()
      .padStart(2, "0")}:${date.getMinutes().toString().padStart(2, "0")}`;
  }
  return "";
};

const convertDateToString = (date) => {
  return `${date.getFullYear().toString().padStart(4, "0")}${(date.getMonth() + 1)
    .toString()
    .padStart(2, "0")}${date.getDate().toString().padStart(2, "0")}${date
    .getHours()
    .toString()
    .padStart(2, "0")}${date.getMinutes().toString().padStart(2, "0")}`;
};

const generateDate = (dateObj) => {
  const padZero = (num) => (num < 10 ? "0" + num.toString() : num.toString());
  const year = dateObj.getFullYear().toString();
  const month = padZero(dateObj.getMonth() + 1);
  const day = padZero(dateObj.getDate());
  return year + month + day;
};

const recurringActivitiesGenerator = (recurringActivity, currentDateObj, daysToGenerate = 7) => {
  const generatedActivities = [];
  let daysInMonths = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  const year = currentDateObj.getFullYear();

  if ((year % 4 === 0 && year % 100 !== 0) || year % 400 === 0) {
    daysInMonths[1] = 29;
  }

  const weekMs = 6.048e8;
  var monthMs = daysInMonths[currentDateObj.getMonth()] * 8.64e7;
  var timeInterval = 0;
  const endDateObj = new Date(currentDateObj.getTime());
  const activityDay = new Date();
  endDateObj.setDate(currentDateObj.getDate() + daysToGenerate);

  if (recurringActivity.frequency === "weekly") {
    activityDay.setDate(activityDay.getDate() + recurringActivity.date - activityDay.getDay());
    timeInterval = weekMs;
  } else {
    activityDay.setDate(recurringActivity.date);
    timeInterval = monthMs;
  }

  let startMs = activityDay.getTime() - weekMs;
  const endMs = endDateObj.getTime();

  while (startMs <= endMs) {
    const activity = {
      id: recurringActivity.activityId,
      startDate: parseTimeToString(generateDate(new Date(startMs)) + recurringActivity.startTime),
      endDate: parseTimeToString(generateDate(new Date(startMs)) + recurringActivity.endTime),
      title: recurringActivity.name,
      description: recurringActivity.description,
      eventType: recurringActivity.eventType,
      tag: recurringActivity.activityTag,
      frequency: recurringActivity.frequency,
      date: recurringActivity.date,
      type: recurringActivity.activityType,
      templateId: recurringActivity.templateActivityId,
    };

    if (recurringActivity.frequency === "monthly") {
      timeInterval = daysInMonths[new Date(startMs).getMonth()] * 8.64e7;
    }

    startMs += timeInterval;
    generatedActivities.push(activity);
  }

  return generatedActivities;
};

const recurringRemindersGenerator = (recurringReminder, currentDateObj, daysToGenerate = 7) => {
  const generatedReminders = [];
  let daysInMonths = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  const year = currentDateObj.getFullYear();

  if ((year % 4 === 0 && year % 100 !== 0) || year % 400 === 0) {
    daysInMonths[1] = 29;
  }

  const weekMs = 6.048e8;
  var monthMs = daysInMonths[currentDateObj.getMonth()] * 8.64e7;
  var timeInterval = 0;
  const endDateObj = new Date(currentDateObj.getTime());
  const reminderStartDay = new Date();
  endDateObj.setDate(currentDateObj.getDate() + daysToGenerate);

  if (recurringReminder.frequency === "weekly") {
    reminderStartDay.setDate(
      reminderStartDay.getDate() + recurringReminder.date - reminderStartDay.getDay()
    );
    timeInterval = weekMs;
  } else {
    reminderStartDay.setDate(recurringReminder.date);
    timeInterval = monthMs;
  }

  let startMs = reminderStartDay.getTime() - weekMs;

  const endMs = endDateObj.getTime();

  while (startMs <= endMs) {
    const reminder = {
      id: recurringReminder.reminderId,
      startDate: parseTimeToString(generateDate(new Date(startMs)) + recurringReminder.endTime),
      title: recurringReminder.name,
      description: recurringReminder.description,
      eventType: recurringReminder.eventType,
      tag: "Reminder",
      frequency: recurringReminder.frequency,
      date: recurringReminder.date,
      type: recurringReminder.reminderType,
      templateId: recurringReminder.templateReminderId,
    };

    if (recurringReminder.frequency === "monthly") {
      timeInterval = daysInMonths[new Date(startMs).getMonth()] * 8.64e7;
    }

    startMs += timeInterval;
    generatedReminders.push(reminder);
  }
  return generatedReminders;
};

export default {
  parseTimeToString,
  parseTimeToDate,
  convertDateToShorterString,
  convertDateToString,
  recurringActivitiesGenerator,
  recurringRemindersGenerator,
};
