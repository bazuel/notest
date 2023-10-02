(async () => {
  if (window.controlMock?.['date']) return;
  let OriginalDate = Date;

  let fakeNow = await window.getActualMockedTimestamp();
  const realStartTimestamp = OriginalDate.now();

  // @ts-ignore
  Date = function () {
    const offset = OriginalDate.now() - realStartTimestamp;

    if (arguments.length === 0) {
      return new OriginalDate(fakeNow + offset);
    } else {
      // @ts-ignore
      return new OriginalDate(...arguments);
    }
  };

  Date.now = function () {
    const offset = OriginalDate.now() - realStartTimestamp;
    return fakeNow + offset;
  };

  Date.parse = function (s) {
    return OriginalDate.parse(s);
  };

  Date.UTC = function (year, month, date, hours, minutes, seconds, ms) {
    return OriginalDate.UTC(year, month, date, hours, minutes, seconds, ms);
  };

  await window.setMockDateTrue();
})();
