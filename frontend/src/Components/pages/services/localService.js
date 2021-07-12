const parseTime = (dateTime) => {
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

const dates = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dev"];

const parseTimeShorter = (dateTime) => {
  if (dateTime) {
    return `${dateTime.getDate().padStart(2, "0")} ${dates[dateTime.getMonth() + 1]} ${dateTime
      .getHours()
      .toString()
      .padStart(2, "0")}:${dateTime.getMinutes().toString.padStart(2, "0")}`;
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

export default { parseTime, parseTimeShorter, convertDateToString };
