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

const convertDateToString = (date) => {
  return `${date.getFullYear()}${
    date.getMonth() + 1
  }${date.getDate()}${date.getHours()}${date.getMinutes()}`;
};

export default { parseTime, convertDateToString };
