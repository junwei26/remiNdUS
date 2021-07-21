exports.checkTimeFormat = (timeString) => {
  if (timeString.length !== 4) {
    return false;
  } else {
    const hrs = parseInt(timeString.slice(0, 2));
    const min = parseInt(timeString.slice(2, 4));
    return 0 <= hrs && hrs <= 24 && 0 <= min && min <= 59;
  }
};
