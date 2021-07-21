const utils = require("./utils.js");

test("Testing correct time input validation", () => {
  expect(utils.checkTimeFormat("0100")).toBe(true);
});

test("Testing incorrect time input validation where time is out of range", () => {
  expect(utils.checkTimeFormat("5000")).toBe(false);
});

test("Testing incorrect time input validation where length of time input is more than 4", () => {
  expect(utils.checkTimeFormat("01000")).toBe(false);
});

test("Testing incorrect time input validation where length of time input is less than 4", () => {
  expect(utils.checkTimeFormat("0")).toBe(false);
});

test("Testing incorrect time input validation where time input is not a number", () => {
  expect(utils.checkTimeFormat("testing")).toBe(false);
});
